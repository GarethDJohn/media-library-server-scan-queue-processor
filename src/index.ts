import Queue from 'bull';
import { Source, SourceScan, SourceFile } from '@media-library/media-library-models';
import { promises as fs } from 'fs';
import path from 'path';
import * as mm from "music-metadata";
import mongoose from 'mongoose';

export async function processDir(sourceId: mongoose.Types.ObjectId, dirPath: string) {
    const dir = await fs.opendir(dirPath);

    if (dir) {
        for await (const dirent of dir) {
            if (dirent.isDirectory()) {
                await processDir(sourceId, path.join(dir.path, dirent.name));
            } else if (dirent.isFile() || dirent.isSymbolicLink()) {
                try {
                    const metadata = await mm.parseFile(path.join(dir.path, dirent.name));

                    const sourceFile = new SourceFile({
                        path: dirPath,
                        sourceId: sourceId,
                        metadata: metadata.common
                    });
                    await sourceFile.save();
                } catch (error) {
                    console.log(error);
                }
            }
        }
    }
}

export async function process(job: Queue.Job) {
    console.log(`job.data: `, JSON.stringify(job.data));

    const { sourceScanId } = job.data;

    const sourceScan = await SourceScan.findById(sourceScanId);

    if (sourceScan) {
        const source = await Source.findById(sourceScan.sourceId);

        if (source) {
            // Clear out any files associated with this source
            await SourceFile.deleteMany({ sourceId: source._id }).exec();

            await processDir(source._id, source.path);
        } else {
            throw new Error(`Source not found: ${sourceScan.sourceId}`);
        }
    } else {
        throw new Error(`SourceScan not found: ${sourceScanId}`);
    }
}
