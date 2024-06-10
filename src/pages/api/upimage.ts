import { NextApiHandler, NextApiRequest } from "next";
import formidable from "formidable";
import path from "path";
import fs from "fs/promises";

export const config = {
    api: {
        bodyParser: false,
    },
};

const pathDist: string =  path.join(process.cwd(), "/public/images");

const readFile = (
    req: NextApiRequest,
    saveLocally?: boolean
): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
    const options: formidable.Options = {};

    if (saveLocally) {
        options.uploadDir = pathDist;
        options.filename = (name, ext, path, form) => {
            return Date.now().toString() + "_" + path.originalFilename;
        };
    }
    options.maxFileSize = 4000 * 1024 * 1024;
    options.keepExtensions = true;

    const form = formidable(options);
    return new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
            if (err) reject(err);
            resolve({ fields, files });
        });
    });
};

const handler: NextApiHandler = async (req: NextApiRequest, res) => {
    try {
        await fs.readdir(pathDist);
    } catch (error) {
        await fs.mkdir(pathDist);
    }

    try {
        const { fields, files } = await readFile(req, true);

        const firstFile = (files as any).myImage[0];
        const size = firstFile.size;
        const filepath = firstFile.filepath;
        const newFilename = firstFile.newFilename;
        const mimetype = firstFile.mimetype;
        const mtime = firstFile.mtime;
        const originalFilename = firstFile.originalFilename;
        const finalFilePath = 'http://localhost:3000/images/' + newFilename;

        return await res.status(200).json({ done: "ok" , filename: newFilename, httpfilepath: finalFilePath});
    }
    catch(error){
        return await res.status(500).json({ done: "not" , filename: '', httpfilepath: ''});
    }
    };

export default handler;