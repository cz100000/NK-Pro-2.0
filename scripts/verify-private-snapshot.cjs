#!/usr/bin/env node
"use strict";
/* Local, offline-only genuine snapshot audit and migration.
   Never run in GitHub Actions with private data; never commit input/output. */
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
const model=require("../private/private-model.js");
function main(args){
 const sourcePath=args[0],outFlag=args.indexOf("--output");
 if(!sourcePath||outFlag>=0&&!args[outFlag+1]){
  process.stderr.write("Usage: node scripts/verify-private-snapshot.cjs /PRIVATE/PATH/snapshot.json [--output /PRIVATE/PATH/nkpro2.json]\n");
  return 2;
 }
 const source=fs.readFileSync(sourcePath,"utf8");
 const sha256=crypto.createHash("sha256").update(source).digest("hex");
 const imported=model.migrate(JSON.parse(source));
 const report=model.summary(imported);
 process.stdout.write(JSON.stringify({readOnly:outFlag<0,sourceSha256:sha256,
  importedSchema:report.schema,sourceVersion:report.sourceVersion,
  units:report.unitCount,tenancies:report.tenancyCount,areaSqm:report.areaSqm,
  meters:report.meterCount,readings:report.meterReadingCount,
  meterPeriods:report.meterPeriodCount,archives:report.archiveYears,
  costsCents:report.costsCents,corrections:report.corrections,
  billingStatus:report.billingStatus,productionReady:false},null,2)+"\n");
 if(outFlag>=0){
  const outfile=path.resolve(args[outFlag+1]);
  if(fs.existsSync(outfile))throw new Error("OUTPUT_ALREADY_EXISTS");
  if(path.resolve(sourcePath)===outfile)throw new Error("REFUSE_OVERWRITE_SOURCE");
  fs.writeFileSync(outfile,JSON.stringify(imported),{encoding:"utf8",flag:"wx",mode:0o600});
  process.stderr.write("PRIVATE_EXPORT_WRITTEN: "+outfile+"\n");
 }
 return 0;
}
try{process.exitCode=main(process.argv.slice(2));}
catch(e){process.stderr.write("PRIVATE_MIGRATION_FAILED: "+e.message+"\n");process.exitCode=1;}
