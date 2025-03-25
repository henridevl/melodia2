import express, { Request, Response } from 'express';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import path from 'path';
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const app = express();
const port = 3000;

ffmpeg.setFfmpegPath(ffmpegPath);

// Configurez Supabase
const supabaseUrl = 'https://your-supabase-url.supabase.co';
const supabaseKey = 'your-supabase-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

app.get('/download/:filename', async (req: Request, res: Response) => {
  const filename = req.params.filename;
  const { data, error } = await supabase.storage
    .from('your-bucket-name')
    .download(filename);

  if (error) {
    return res.status(500).send({
      message: 'Could not download the file from Supabase. ' + error.message,
    });
  }

  const inputFilePath = path.join(__dirname, 'temp', filename);
  const outputFilePath = path.join(
    __dirname,
    'temp',
    `${filename.split('.')[0]}.mp3`
  );

  fs.writeFileSync(inputFilePath, data);

  const command = ffmpeg(inputFilePath)
    .output(outputFilePath)
    .on('end', () => {
      res.download(outputFilePath, `${filename.split('.')[0]}.mp3`, (err) => {
        if (err) {
          res.status(500).send({
            message: 'Could not download the file. ' + err,
          });
        }
        // Supprimez les fichiers temporaires après le téléchargement
        fs.unlink(inputFilePath, (err) => {
          if (err) {
            console.error('Error deleting the input file:', err);
          }
        });
        fs.unlink(outputFilePath, (err) => {
          if (err) {
            console.error('Error deleting the converted file:', err);
          }
        });
      });
    })
    .on('error', (err) => {
      console.error('Error converting the file:', err);
      res.status(500).send({
        message: 'Could not convert the file. ' + err,
      });
    })
    .run();
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
