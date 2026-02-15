import express, {Response, Request} from "express";
import {IMessage} from "../types";
import fs from "fs/promises";

const messagesRouter = express.Router();

messagesRouter.post('/', async (req: Request, res: Response) => {
    if (req.body.message) {
        const newMessage: IMessage = {
            message: req.body.message,
            date: new Date().toISOString()
        }

        const fileName = `${newMessage.date.replace(/:/g, '-')}`;

        try {
            await fs.writeFile(`./messages/${fileName}.txt`, JSON.stringify(newMessage));
            return res.send(newMessage);
        } catch (e) {
            return res.status(500).send('Error writing message');
        }
    } else {
        return res.status(400).send('All fields must be filled in');
    }
});

messagesRouter.get('/', async (req: Request, res: Response) => {
    try {
        const files = await fs.readdir('./messages');
        const lastFiles = files.sort().reverse().slice(0, 5);

        const messagesPromises: Promise<IMessage>[] = lastFiles.map(async (file) => {
            const messageData = await fs.readFile(`./messages/${file}`);
            return JSON.parse(messageData.toString());
        });

        const messages = await Promise.all(messagesPromises);
        return res.send(messages);
    } catch (e) {
        return res.status(500).send('Error reading messages');
    }
})

export default messagesRouter;