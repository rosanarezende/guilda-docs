// SPDX-License-Identifier: MIT
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { Ajv2020 } from 'ajv/dist/2020.js';
import type { SchemaObject, ValidateFunction } from 'ajv';
import { parseDocument } from 'yaml';

const require = createRequire(import.meta.url);
const addFormats: (instance: Ajv2020) => void = require('ajv-formats');
type ObjectValue = Record<string, unknown>;
type Entry = { file: string; schema: string; kind: string; id: string; revision: string; sha256: string };
type Attachment = { file: string; sha256: string; reference?: ObjectValue };
type Catalog = { formatVersion: string; fictional: boolean; namespace: string; records: Entry[]; attachments: Attachment[] };
type Manifest = { formatVersion: string; contracts: { file: string; sha256: string }[] };
const rootDirectory = path.resolve(fileURLToPath(new URL('../', import.meta.url)));
const sha256 = (bytes: string | Buffer): string => createHash('sha256').update(bytes).digest('hex');
function check(condition: unknown, message: string): asserts condition { if (!condition) throw new Error(message); }
function object(value: unknown): ObjectValue { check(value !== null && typeof value === 'object' && !Array.isArray(value), 'Objeto esperado.'); return value as ObjectValue; }
function at(value: unknown, ...keys: string[]): unknown { for (const key of keys) value = object(value)[key]; return value; }
function string(value: unknown): string { check(typeof value === 'string', 'Texto esperado.'); return value; }
function list(value: unknown): unknown[] { check(Array.isArray(value), 'Lista esperada.'); return value; }
function confined(base: string, relative: string): string {
  const target = path.resolve(base, relative);
  check(target === base || target.startsWith(base + path.sep), 'Caminho fora do acervo: ' + relative);
  return target;
}
function yaml(text: string): unknown {
  const document = parseDocument(text, { uniqueKeys: true, schema: 'core' });
  check(document.errors.length === 0, 'YAML inválido: ' + document.errors.map(error => error.message).join('; '));
  return document.toJSON();
}
function validator(): Ajv2020 {
  const ajv = new Ajv2020({ allErrors: true, strict: true, strictRequired: false });
  addFormats(ajv);
  return ajv;
}
export async function validateFile(schemaFile: string, dataFile: string): Promise<void> {
  const schema = JSON.parse(await readFile(schemaFile, 'utf8')) as SchemaObject;
  const verify = validator().compile(schema);
  check(verify(yaml(await readFile(dataFile, 'utf8'))), dataFile + ': estrutura inválida: ' + JSON.stringify(verify.errors));
}
const referenceKey = (reference: ObjectValue): string => [reference.namespace, reference.kind, reference.id, reference.revision].join('|');
const jsonWalk = (value: unknown, visit: (item: ObjectValue) => void): void => {
  if (Array.isArray(value)) { for (const item of value) jsonWalk(item, visit); }
  else if (value !== null && typeof value === 'object') { const item = object(value); visit(item); for (const child of Object.values(item)) jsonWalk(child, visit); }
};

/** Confere os formatos e a integridade do cenário documental; não executa o domínio privado. */
export async function audit(root = rootDirectory): Promise<{ schemas: number; records: number; references: number }> {
  const schemaRoot = confined(root, 'schemas/1.0.0');
  const sampleRoot = confined(root, 'examples/primeiro-valor');
  const manifest = JSON.parse(await readFile(path.join(schemaRoot, 'manifest.json'), 'utf8')) as Manifest;
  const catalog = JSON.parse(await readFile(path.join(sampleRoot, 'catalog.json'), 'utf8')) as Catalog;
  check(manifest.formatVersion === '1.0.0' && catalog.formatVersion === manifest.formatVersion, 'Versão do catálogo incompatível.');
  check(catalog.fictional === true, 'O cenário precisa declarar dados fictícios.');
  const ajv = validator();
  const validations = new Map<string, ValidateFunction>();
  check(new Set(manifest.contracts.map(entry => entry.file)).size === manifest.contracts.length, 'Schema repetido no manifesto.');
  const actualSchemas = (await readdir(schemaRoot)).filter(file => file.endsWith('.schema.json')).sort();
  check(JSON.stringify(actualSchemas) === JSON.stringify(manifest.contracts.map(entry => entry.file).sort()), 'Schemas fora do manifesto ou ausentes.');
  for (const entry of manifest.contracts) {
    const bytes = await readFile(confined(schemaRoot, entry.file));
    check(sha256(bytes) === entry.sha256, 'Integridade do schema: ' + entry.file);
    const schema = JSON.parse(bytes.toString()) as SchemaObject;
    check(ajv.validateSchema(schema), 'JSON Schema inválido: ' + entry.file);
    validations.set(entry.file.replace('.schema.json', ''), ajv.compile(schema));
  }
  const values = new Map<string, unknown>();
  const references = new Map<string, string>();
  for (const entry of catalog.records) {
    const bytes = await readFile(confined(sampleRoot, entry.file));
    check(sha256(bytes) === entry.sha256, 'Integridade do registro: ' + entry.file);
    const value = yaml(bytes.toString());
    const verify = validations.get(entry.schema);
    check(verify, 'Schema não publicado: ' + entry.schema);
    check(verify(value), entry.file + ': estrutura inválida: ' + JSON.stringify(verify.errors));
    check(!values.has(entry.file), 'Arquivo repetido no catálogo: ' + entry.file);
    values.set(entry.file, value);
    const key = referenceKey({ namespace: catalog.namespace, ...entry });
    check(!references.has(key), 'Identidade revisionada duplicada no catálogo: ' + key);
    references.set(key, entry.file);
    if (entry.schema === 'work-brief' || entry.schema === 'work-state') check(at(value, 'work', 'id') === entry.id, 'Identidade do trabalho difere do catálogo.');
    else if (object(value).metadata && at(value, 'metadata', 'id') !== undefined) {
      check(at(value, 'metadata', 'id') === entry.id, 'Identidade difere do catálogo: ' + entry.file);
      if (at(value, 'metadata', 'revision') !== undefined) check(String(at(value, 'metadata', 'revision')) === entry.revision, 'Revisão difere do catálogo.');
    }
  }
  check([...validations.keys()].every(name => catalog.records.some(entry => entry.schema === name)), 'Contrato publicado sem exemplo válido.');
  for (const entry of catalog.attachments) {
    const bytes = await readFile(confined(sampleRoot, entry.file));
    check(sha256(bytes) === entry.sha256, 'Integridade do anexo: ' + entry.file);
    if (entry.reference) {
      check(entry.reference.revision === 'sha256:' + entry.sha256, 'Revisão do anexo não corresponde aos bytes.');
      const key = referenceKey(entry.reference);
      check(!references.has(key), 'Referência repetida: ' + key);
      references.set(key, entry.file);
    }
  }
  let referenceCount = 0;
  for (const [file, value] of values) jsonWalk(value, item => {
    if (['namespace', 'kind', 'id', 'revision'].every(key => typeof item[key] === 'string')) {
      check(references.has(referenceKey(item)), 'Referência revisionada não resolvida em ' + file + ': ' + referenceKey(item));
      referenceCount++;
    }
  });
  const kindAliases: Record<string, string> = { intent: 'intent-aggregate', initiative: 'initiative-aggregate' };
  for (const [file, value] of values) jsonWalk(value, item => {
    for (const child of Object.values(item)) for (const token of Array.isArray(child) ? child : [child]) {
      if (typeof token !== 'string') continue;
      const local = token.match(/^(business-thesis|business-objective|metric-definition|intent|initiative):([a-z0-9-]+)$/);
      if (local) {
        const kind = kindAliases[local[1]!] ?? local[1]!;
        check(catalog.records.some(entry => entry.kind === kind && entry.id === local[2]), 'Referência textual não resolvida em ' + file + ': ' + token);
        referenceCount++;
      }
      const work = token.match(/^work:([a-z-]+)\/([a-z0-9-]+)$/);
      if (work) {
        const entry = catalog.records.find(entry => entry.schema === 'work-brief' && entry.id === work[2]);
        check(entry && at(values.get(entry.file), 'work', 'type') === work[1], 'Referência textual não resolvida em ' + file + ': ' + token);
        referenceCount++;
      }
    }
  });
  const get = (name: string): unknown => { const value = values.get(name); check(value !== undefined, 'Registro ausente: ' + name); return value; };
  const resolveRelative = async (owner: string, target: string): Promise<void> => {
    const relative = path.relative(sampleRoot, path.resolve(sampleRoot, path.dirname(owner), target));
    await readFile(confined(sampleRoot, relative));
  };
  const pathKeys = new Set(['initiative-ref', 'activation-decision-ref', 'activation-gate-ref', 'intent-ref', 'planned-in', 'materialize-intent', 'file', 'decision-record', 'outcome-ref', 'path']);
  const arrayPathKeys = new Set(['evidence', 'evidence-refs', 'required-evidence', 'supported-by']);
  for (const [file, value] of values) {
    const paths: string[] = [];
    jsonWalk(value, item => {
      for (const [key, child] of Object.entries(item)) {
        if (pathKeys.has(key) && typeof child === 'string' && /\.(yml|yaml|md|csv)$/.test(child)) paths.push(child);
        if (arrayPathKeys.has(key) && Array.isArray(child)) for (const link of child) if (typeof link === 'string' && /\.(yml|yaml|md|csv)$/.test(link)) paths.push(link);
      }
    });
    for (const link of paths) { await resolveRelative(file, link); referenceCount++; }
  }
  const initiative = get('initiatives/primeiro-valor/initiative.yml');
  const activation = get('initiatives/primeiro-valor/activation.yml');
  for (const [key, file] of [['initiative-hash', 'initiative.yml'], ['triage-hash', 'triage.yml']]) {
    check(at(activation, 'decision-briefing', 'technical-layer', key) === sha256(await readFile(path.join(sampleRoot, 'initiatives/primeiro-valor', file!))), 'Base da ativação diverge: ' + key);
  }
  check(at(activation, 'metadata', 'base-revision') === at(initiative, 'metadata', 'revision'), 'Ativação referencia outra revisão da iniciativa.');
  const breakdown = get('intents/orientar-primeiro-valor/breakdown.yml');
  const works = list(at(breakdown, 'breaks-into', 'works')).map(object);
  const workKeys = new Set(works.map(work => work['governance-root'] + '/' + work.id));
  for (const work of works) {
    check(work['governance-root'] === 'acme-produto', 'Raiz não declarada no cenário.');
    const id = string(work.id);
    for (const name of ['brief', 'state']) check(at(get('works/' + id + '/' + name + '.yml'), 'work', 'id') === id, 'Trabalho planejado sem materialização correspondente.');
    for (const dependency of list(work['depends-on']).map(object)) check(workKeys.has(dependency['governance-root'] + '/' + dependency['work-id']), 'Dependência do plano não resolve.');
  }
  for (const criterion of list(at(breakdown, 'exit-criteria')).map(object)) for (const reference of list(criterion['work-refs']).map(object)) check(workKeys.has(reference['governance-root'] + '/' + reference['work-id']), 'Critério aponta trabalho ausente.');
  const ledgerFile = 'works/medicao-primeiro-valor/deliberation.yml';
  const ledger = get(ledgerFile);
  for (const entry of list(at(ledger, 'qrds')).map(object)) {
    const fullPath = confined(sampleRoot, path.join(path.dirname(ledgerFile), string(entry.file)));
    const text = await readFile(fullPath, 'utf8');
    const front = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
    check(front, 'QRD sem cabeçalho: ' + fullPath);
    const header = object(yaml(front[1]!));
    check(header.artifact === 'qrd' && header.mode === 'choice' && header.id === entry.id && header.status === entry.status && header.subject === at(ledger, 'subject'), 'QRD diverge do índice.');
    const headings = ['## Q — Question', '## R — Reasoning/Research', '## D — Decision'].map(title => text.indexOf(title));
    check(headings[0]! >= 0 && headings[1]! > headings[0]! && headings[2]! > headings[1]!, 'QRD sem Q/R/D na ordem documental.');
    for (let index = 0; index < 3; index++) check(text.slice(headings[index], headings[index + 1] ?? text.length).split('\n').slice(1).join('\n').trim().length > 0, 'Seção vazia na QRD.');
  }
  const target = get('business/target.yml');
  const outcome = get('business/outcome.yml');
  const intent = get('intents/orientar-primeiro-valor/intent.yml');
  check(referenceKey(object(at(intent, 'target-outcome', 'metric-ref'))) === referenceKey(object(at(target, 'metadata', 'metric-ref'))), 'Intent e alvo apontam métricas diferentes.');
  const observationWindow = object(at(outcome, 'observation-window'));
  const starts = Date.parse(string(observationWindow['starts-at']));
  const ends = Date.parse(string(observationWindow['ends-at']));
  const observed = Date.parse(string(at(outcome, 'observation', 'observed-at')));
  check(Number.isFinite(starts) && Number.isFinite(ends) && starts <= observed && observed <= ends, 'Janela de observação incoerente.');
  check(JSON.stringify(observationWindow) === JSON.stringify(at(target, 'metadata', 'observation-window')), 'Janela do resultado difere do alvo no cenário.');
  const csv = await readFile(path.join(sampleRoot, 'works/medicao-primeiro-valor/evidence/observations.csv'), 'utf8');
  const rows = csv.trim().split(/\r?\n/).slice(1).map(line => line.split(','));
  const means = new Map<string, number[]>();
  for (const row of rows) {
    const duration = Number(row[4]);
    check(Number.isFinite(duration) && duration >= 0 && Date.parse(row[3]!) - Date.parse(row[2]!) === duration, 'Duração do CSV incoerente.');
    if (row[0] === 'follow-up') check(Date.parse(row[2]!) >= starts && Date.parse(row[3]!) <= ends, 'Amostra fora da janela.');
    const values = means.get(row[0]!) ?? []; values.push(duration); means.set(row[0]!, values);
  }
  const mean = (name: string): number => { const values = means.get(name); check(values?.length, 'Grupo de medição ausente: ' + name); return values.reduce((a,b) => a+b,0)/values.length; };
  check(at(outcome, 'observation', 'value') === mean('follow-up'), 'Resultado diverge do CSV.');
  check(at(target, 'metadata', 'baseline', 'value') === mean('baseline'), 'Situação inicial diverge do CSV.');
  const walkMarkdown = async (directory: string): Promise<void> => {
    for (const item of await readdir(directory, { withFileTypes: true })) {
      if (['node_modules', '.git'].includes(item.name)) continue;
      const file = path.join(directory, item.name);
      if (item.isDirectory()) await walkMarkdown(file);
      else if (item.name.endsWith('.md')) {
        const source = await readFile(file, 'utf8');
        check(!/C:[\\/]Users[\\/]/i.test(source), 'Caminho privado em ' + file);
        for (const match of source.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)) {
          if (/^(https?:|mailto:)/.test(match[1]!)) continue;
          const target = match[1]!.split('#')[0]!;
          if (!target) continue;
          const absolute = confined(root, path.relative(root, path.resolve(path.dirname(file), decodeURIComponent(target))));
          await readFile(absolute); referenceCount++;
        }
      }
    }
  };
  await walkMarkdown(root);
  return { schemas: validations.size, records: values.size, references: referenceCount };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const args = process.argv.slice(2);
    if (args[0] === '--schema') {
      check(args.length >= 3, 'Uso: npm run validate -- --schema <schema.json> <registro.yml> [...registros]');
      for (const file of args.slice(2)) { await validateFile(args[1]!, file); console.log(file + ': formato válido.'); }
    } else {
      check(args.length === 0, 'Opção desconhecida. Use --schema para conferir seus próprios arquivos.');
      console.log('Conferência local: ' + JSON.stringify(await audit()));
      console.log('Dados sintéticos; formato e integridade não autenticam decisões nem demonstram efeito real.');
    }
  } catch (error) { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; }
}
