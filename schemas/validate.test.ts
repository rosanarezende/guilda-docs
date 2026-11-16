// SPDX-License-Identifier: MIT
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, cp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { parse, stringify } from 'yaml';
import { audit } from './validate.ts';

const source = path.resolve(fileURLToPath(new URL('../', import.meta.url)));
type Catalog = { records: { file: string; sha256: string }[] };
async function withCopy(run: (root: string) => Promise<void>): Promise<void> {
  const prefix = path.join(tmpdir(), 'guilda-open-format-');
  const root = await mkdtemp(prefix);
  try {
    for (const name of ['schemas', 'examples', 'docs', 'assets']) await cp(path.join(source, name), path.join(root, name), { recursive: true });
    for (const name of ['README.md', 'LICENSE']) await cp(path.join(source, name), path.join(root, name));
    await run(root);
  } finally {
    assert.ok(path.resolve(root).startsWith(path.resolve(prefix)));
    await rm(root, { recursive: true, force: true });
  }
}
async function changeRecord(root: string, file: string, mutate: (value: Record<string, unknown>) => void): Promise<void> {
  const directory = path.join(root, 'examples/primeiro-valor');
  const target = path.join(directory, file);
  const value = parse(await readFile(target, 'utf8')) as Record<string, unknown>;
  mutate(value);
  const bytes = stringify(value);
  await writeFile(target, bytes);
  const catalogFile = path.join(directory, 'catalog.json');
  const catalog = JSON.parse(await readFile(catalogFile, 'utf8')) as Catalog;
  const entry = catalog.records.find(entry => entry.file === file);
  assert.ok(entry);
  entry.sha256 = createHash('sha256').update(bytes).digest('hex');
  await writeFile(catalogFile, JSON.stringify(catalog, null, 2) + '\n');
}
test('aceita o pacote completo com os registros canônicos', async () => {
  const result = await audit(); assert.equal(result.schemas, 16); assert.equal(result.records, 19);
});
test('recusa um campo inventado na Intent, mesmo com o hash do exemplo atualizado', async () => withCopy(async root => {
  await changeRecord(root, 'intents/orientar-primeiro-valor/intent.yml', value => { value.hypothesis = 'Campo inventado'; });
  await assert.rejects(audit(root), /estrutura inválida/);
}));
test('recusa referência a revisão inexistente', async () => withCopy(async root => {
  await changeRecord(root, 'business/outcome.yml', value => { (value['target-ref'] as Record<string, unknown>).revision = '999'; });
  await assert.rejects(audit(root), /Referência revisionada não resolvida/);
}));
test('recusa alteração de bytes em um schema publicado', async () => withCopy(async root => {
  const file = path.join(root, 'schemas/1.0.0/intent.schema.json'); await writeFile(file, (await readFile(file, 'utf8')) + '\n');
  await assert.rejects(audit(root), /Integridade do schema/);
}));
test('recusa resultado numérico que não corresponde à fonte sintética', async () => withCopy(async root => {
  await changeRecord(root, 'business/outcome.yml', value => { (value.observation as Record<string, unknown>).value = 0; });
  await assert.rejects(audit(root), /Resultado diverge do CSV/);
}));
test('recusa evidência alterada sem reconferir sua revisão', async () => withCopy(async root => {
  const file = path.join(root, 'examples/primeiro-valor/works/medicao-primeiro-valor/evidence/observations.csv'); await writeFile(file, (await readFile(file, 'utf8')).replace('345600000', '0'));
  await assert.rejects(audit(root), /Integridade do anexo/);
}));
test('recusa vínculo textual de objetivo com métrica inexistente', async () => withCopy(async root => {
  await changeRecord(root, 'business/objective.yml', value => { (value.relations as Record<string, unknown>)['measured-by'] = 'metric-definition:metrica-ausente'; });
  await assert.rejects(audit(root), /Referência textual não resolvida/);
}));
