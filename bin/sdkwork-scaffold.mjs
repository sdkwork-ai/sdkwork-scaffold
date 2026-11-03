#!/usr/bin/env node

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  ARCHITECTURES,
  SCAFFOLD_VERSION,
  TEMPLATE_GROUPS,
} from '../scaffold.config.mjs';
import { COMPONENTS } from '../components.config.mjs';
import { USAGE, parseScaffoldArguments } from '../lib/arguments.mjs';
import { componentCatalogForList } from '../lib/components.mjs';
import {
  createVariables,
  findSpecsDirectory,
  generateProject,
  planGeneration,
} from '../lib/generator.mjs';
import { selfCheck, verifyGeneratedRepository } from '../lib/verify.mjs';

const SCAFFOLD_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function printList() {
  console.log(`SDKWork scaffold ${SCAFFOLD_VERSION}`);
  console.log('');
  console.log('Template groups:');
  for (const group of TEMPLATE_GROUPS) {
    const architectures = group.architectures ? ` [${group.architectures.join(', ')}]` : '';
    console.log(`- ${group.id}${architectures}: ${group.description}`);
  }
  console.log('');
  console.log(`Architectures: ${Object.keys(ARCHITECTURES).join(', ')}`);
}

function printArchitectures() {
  console.log('SDKWork scaffold architectures');
  console.log('');
  for (const architecture of Object.values(ARCHITECTURES)) {
    console.log(`- ${architecture.id}: ${architecture.title} (${architecture.kind}) -> apps/sdkwork-<code>-${architecture.suffix}`);
    console.log(`  ${architecture.description}`);
    console.log(`  runtime: ${architecture.runtime.family}/${architecture.runtime.framework}; platform: ${architecture.runtime.defaultPlatform}`);
  }
}

function printComponents(workspace) {
  const catalog = componentCatalogForList(workspace);
  console.log('SDKWork common component catalog');
  console.log('');
  console.log('| Id | Component | Category | Kind | SDK family | Default | Languages |');
  console.log('| --- | --- | --- | --- | --- | --- | --- |');
  for (const row of catalog) {
    console.log(`| ${row.id} | ${row.title} | ${row.category} | ${row.kind} | ${row.sdkFamily ?? '—'} | ${row.defaultEnabled ? 'yes' : 'no'} | ${row.languages.join(', ')} |`);
  }
}

function printPlan(plan) {
  console.log('Generation plan:');
  for (const entry of plan) {
    console.log(`- ${entry.group}${entry.architecture ? ` [${entry.architecture}]` : ''} -> ${entry.target}`);
  }
}

function main() {
  let options;
  try {
    options = parseScaffoldArguments(process.argv.slice(2));
  } catch (error) {
    console.error(`error: ${error.message}\n`);
    console.error(USAGE);
    process.exit(2);
  }

  if (options.help) {
    console.log(USAGE);
    return;
  }
  if (options.list) {
    printList();
    return;
  }
  if (options.listArchitectures) {
    printArchitectures();
    return;
  }
  if (options.listComponents) {
    printComponents(path.dirname(SCAFFOLD_ROOT));
    return;
  }
  if (options.selfCheck) {
    const result = selfCheck(SCAFFOLD_ROOT);
    if (!result.ok) {
      console.error(`Scaffold self-check failed (${result.issues.length} issue(s)):`);
      for (const issue of result.issues) console.error(`- ${issue}`);
      process.exit(1);
    }
    console.log(`Scaffold self-check passed (${TEMPLATE_GROUPS.length} template groups, ${Object.keys(ARCHITECTURES).length} architectures)`);
    return;
  }

  const specsDirectory = findSpecsDirectory({
    explicit: options.specs,
    target: options.target,
    scaffoldRoot: SCAFFOLD_ROOT,
  });

  if (options.dryRun) {
    const variables = createVariables({
      options,
      specsDirectory,
      generatedAt: new Date().toISOString(),
      components: [],
    });
    console.log(`Dry run for sdkwork-${options.code} at ${options.target}`);
    console.log(`specs: ${specsDirectory ?? '(not found; using ../sdkwork-specs)'}`);
    console.log(`variables: APP_CODE=${variables.APP_CODE}, APP_TYPE=${variables.APP_TYPE}, SPECS_REL=${variables.SPECS_REL}`);
    console.log(`architectures: ${options.architectures.join(', ')}`);
    console.log(`components: ${options.components.map((component) => component.id).join(', ') || '(none)'}`);
    console.log('');
    printPlan(planGeneration({ options, scaffoldRoot: SCAFFOLD_ROOT }));
    return;
  }

  let result;
  try {
    result = generateProject({
      options,
      scaffoldRoot: SCAFFOLD_ROOT,
      specsDirectory,
    });
  } catch (error) {
    console.error(`error: ${error.message}`);
    process.exit(1);
  }

  console.log(`Generated sdkwork-${options.code} at ${result.target}`);
  console.log(`Files written: ${result.written.length}`);
  console.log(`Architectures: ${options.architectures.join(', ')}`);
  console.log(`Components: ${result.components.map((component) => component.id).join(', ') || '(none)'}`);
  if (result.post.git) {
    console.log(`git: ${result.post.git.initialized ? 'initialized on main' : result.post.git.reason}`);
  }
  if (result.post.specsAutomation?.applied) {
    const steps = result.post.specsAutomation.results ?? [];
    const failed = steps.filter((step) => !step.ok);
    console.log(`sdkwork-specs automation: ${steps.length} step(s), ${failed.length} failed`);
    for (const step of failed) console.log(`! ${step.step} did not complete; check the command output above`);
  }
  if (result.post.install) {
    console.log(`dependencies: ${result.post.install.installed ? 'installed' : 'install failed (run pnpm install)'}`);
  }

  if (options.verify) {
    const verification = verifyGeneratedRepository(result.target, options);
    if (!verification.ok) {
      console.error(`Local verification failed (${verification.issues.length} issue(s)):`);
      for (const issue of verification.issues) console.error(`- ${issue}`);
      process.exit(1);
    }
    console.log(`Local verification: passed (${verification.checkedFiles} required files)`);
  }
}

main();
