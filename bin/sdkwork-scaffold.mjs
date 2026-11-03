#!/usr/bin/env node

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  DEFAULT_SURFACES,
  SCAFFOLD_VERSION,
  TEMPLATE_GROUPS,
  WEB_SURFACES,
} from '../scaffold.config.mjs';
import { USAGE, parseScaffoldArguments } from '../lib/arguments.mjs';
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
    console.log(`- ${group.id}: ${group.description}`);
  }
  console.log('');
  console.log(`Web surfaces: ${Object.keys(WEB_SURFACES).join(', ')} (default: ${DEFAULT_SURFACES.join(', ')})`);
}

function printPlan(plan) {
  console.log('Generation plan:');
  for (const entry of plan) {
    if (entry.warning) {
      console.log(`! ${entry.warning}`);
      continue;
    }
    console.log(`- ${entry.group}${entry.surface ? ` [${entry.surface}]` : ''} -> ${entry.target}`);
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

  if (options.help || options.list || options.selfCheck) {
    if (options.selfCheck) {
      const result = selfCheck(SCAFFOLD_ROOT);
      if (!result.ok) {
        console.error(`Scaffold self-check failed (${result.issues.length} issue(s)):`);
        for (const issue of result.issues) console.error(`- ${issue}`);
        process.exit(1);
      }
      console.log(`Scaffold self-check passed (${TEMPLATE_GROUPS.length} template groups)`);
      return;
    }
    if (options.list) printList();
    else console.log(USAGE);
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
    });
    console.log(`Dry run for sdkwork-${options.code} at ${options.target}`);
    console.log(`specs: ${specsDirectory ?? '(not found; using ../sdkwork-specs)'}`);
    console.log(`variables: APP_CODE=${variables.APP_CODE}, APP_TYPE=${variables.APP_TYPE}, SPECS_REL=${variables.SPECS_REL}`);
    console.log(`surfaces: ${options.surfaces.join(', ')}`);
    console.log('');
    printPlan(planGeneration({ options, scaffoldRoot: SCAFFOLD_ROOT, specsDirectory }));
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
  console.log(`Surfaces: ${options.surfaces.join(', ')}`);
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
