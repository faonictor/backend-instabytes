import {
  getTodosOsPosts,
  criarPostNovo,
  atualizarPost,
} from "../models/postsModels.js";
import fs from "fs";
import gerarDescricaoComGemini from "../services/serviceGemini.js";

export async function listarPosts(req, res) {
  const posts = await getTodosOsPosts();
  res.status(200).json(posts);
}

export async function criarPost(req, res) {
  const novoPost = req.body;
  try {
    const postCriado = await criarPostNovo(novoPost);
    res.status(200).json(postCriado);
  } catch (erro) {
    console.error(erro.message);
    res.status(500).json({ Erro: "Falha na requisição" });
  }
}

export async function uploadImagem(req, res) {
  const novoPost = {
    descricao: "",
    imgUrl: req.file.originalName,
    alt: "",
  };
  try {
    const postCriado = await criarPostNovo(novoPost);
    const imagemAtualizada = `uploads/${postCriado.insertedId}.png`;
    fs.renameSync(req.file.path, imagemAtualizada);
    res.status(200).json(postCriado);
  } catch (erro) {
    console.error(erro.message);
    res.status(500).json({ Erro: "Falha na requisição" });
  }
}

export async function updateNovoPost(req, res) {
  const id = req.params.id;
  const urlImagem = `http://localhost:3000/${id}.png`;

  try {
    const imageBuffer = fs.readFileSync(`uploads/${id}.png`);
    const descricao = await gerarDescricaoComGemini(imageBuffer);
    const atualPost = {
      imgUrl: urlImagem,
      descricao: descricao,
      alt: req.body.alt,
    };
    const postCriado = await atualizarPost(id, atualPost);
    res.status(200).json(postCriado);
  } catch (erro) {
    console.error(erro.message);
    res.status(500).json({ Erro: "Falha na requisição" });
  }
}
