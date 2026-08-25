import app from './app';

const PORT = Number(process.env.PORT) || 4000;

app.listen(PORT, () => {
  console.log(`Videoselz analytics API listening on http://localhost:${PORT}`);
});
