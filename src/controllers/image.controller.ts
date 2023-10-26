import { Request, Response } from "express";
import { readFile } from 'fs/promises'
import { decryptData } from "../helpers/crypto.helper";

const getProfileImg = async (req: Request, res: Response) => {
    try {
        let { id } = req.params;
        console.log(id)
       // id = decryptData(id)
       // console.log(id)
        const filePath = `/home/server/media/profile/${id}`; 
        console.log("dosya adı" + filePath)
        const data = await readFile(filePath);
        res.setHeader('Content-Type', 'image');
        res.status(200).send(data);
    } catch (error) {
        res.status(500).json({ message: "Resim Yüklenemedi: \n", error })
    }
}
const getTokenImg = async (req: Request, res: Response) => {
    try {
        let { id } = req.params;
        console.log(id)
       // id = decryptData(id)
       // console.log(id)
        const filePath = `/home/server/media/token/${id}`; 
        console.log("dosya adı" + filePath)
        const data = await readFile(filePath);
        res.setHeader('Content-Type', 'image');
        res.status(200).send(data);
    } catch (error) {
        res.status(500).json({ message: "Resim Yüklenemedi: \n", error })
    }
}

export{
    getProfileImg,getTokenImg
}