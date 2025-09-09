
const GAS_URL = "https://script.google.com/macros/s/AKfycbzPOoPcWQUaQyzj6GxoYIDsEGl1wnr7G9sDhwnaGCNreJhYgWrP_faUEtnoCqVQH2T7/exec";

document.addEventListener("DOMContentLoaded", function() {
  var sources = ["adsmovil", "adsplay", "afresp", "alta", "alvaro", "atalaia", "bing", "bronstein", "cdc", "cdpi", "cedic", "cerpe", "comunicacaotwilio", "crm", "cytolab", "delboni", "deliberato", "exame", "facebook", "firebase", "frischmann", "google", "instagram", "lavoisier", "linkedin", "memed", "nac", "perplexity", "salomao", "sergiof", "sfmc", "social", "spotify", "tiktok", "uber", "yahoo","yandex", "youtube"];
  var mediums = ["cpc","cpm","cpv","email","sms","social","whatsapp","push","qrcode","dynamic-link","link-bio","display","totem","chatbot","webpush","site"];
  var marcas = ["alta","alvaro","atalaia","bronstein","boris","cdpi","cediccedilab","cerpe","cytolab","delboni","deliberato","exame","frischmann","gilsoncidrim","image","itulab","lavoisier","leme","lamina","multiimagem","oswaldocruz","padrao","previlab","salomaozoppi","sergiofranco","saocamilo","valeclin","vitalbrasil","dasa","nav","alvaroapoio","dasaeduca","ciia","chromatox","genomica","navpro","genera"];
  var canais = ["google","facebook","chatbot","ura","memed","link-bio","qrcode","totem-cdpi","pmax","crm"];
  var formatos = ["search","storie","video","post","display","email","menssagem","sms","push"];
  var objetivos = ["conversao","clique","trafego","regua-comunicacao","awareness","receita"];

  preencherSelect("source", sources);
  preencherSelect("medium", mediums);
  preencherSelect("marca", marcas);
  preencherSelect("canal", canais);
  preencherSelect("formato", formatos);
  preencherSelect("objetivo", objetivos);

  document.querySelectorAll('input[name="modo"]').forEach(r => r.addEventListener("change", onChangeModo));
  document.getElementById("btnShorten").addEventListener("click", encurtarURLUnified);
  document.getElementById("btnQr").addEventListener("click", gerarQRCodeUnified);
  document.getElementById("url").addEventListener("input", function(){
    if (getModo()==="quick") {
      document.getElementById("urlGerada").value = document.getElementById("url").value.trim();
    }
  });

  onChangeModo();
});

function preencherSelect(id, valores) {
  var select = document.getElementById(id);
  valores.forEach(v => {
    var o = document.createElement("option");
    o.value = v; o.textContent = v;
    select.appendChild(o);
  });
}

function getDestino() {
  var checked = document.querySelector('input[name="destino"]:checked');
  return checked ? checked.value : "nav";
}
function getModo() {
  var checked = document.querySelector('input[name="modo"]:checked');
  return checked ? checked.value : "param";
}

// ===== Parametrização =====
var ultimaURL = "";
var qrCode = null;

function gerarURL() {
  limparErros();

  var url = document.getElementById("url");
  var source = document.getElementById("source");
  var medium = document.getElementById("medium");
  var idCampanha = document.getElementById("idCampanha");
  var marca = document.getElementById("marca");
  var canal = document.getElementById("canal");
  var formato = document.getElementById("formato");
  var nomeCampanha = document.getElementById("nomeCampanha");
  var objetivo = document.getElementById("objetivo");

  var valido = true;
  if (!/^https?:\/\//.test(url.value.trim())) { mostrarErro(url,"Insira uma URL válida (ex: https://...)"); valido = false; }
  var padraoValido = /^[a-zA-Z0-9-]+$/;
  if (!padraoValido.test(idCampanha.value.trim())) { mostrarErro(idCampanha,"Use apenas números, letras e hífen"); valido = false; }
  if (!padraoValido.test(nomeCampanha.value.trim())) { mostrarErro(nomeCampanha,"Use apenas números, letras e hífen"); valido = false; }
  if (!valido) return;

  var campaignValue = [idCampanha.value.trim(),marca.value,canal.value,formato.value,nomeCampanha.value.trim(),objetivo.value].join("_");
  ultimaURL = url.value.trim() + "?utm_source=" + source.value + "&utm_medium=" + medium.value + "&utm_campaign=" + campaignValue;

  document.getElementById("resultado").style.display = "block";
  document.getElementById("labelUrlGerada").textContent = "URL Parametrizada:";
  document.getElementById("urlGerada").value = ultimaURL;
  document.getElementById("shortContainer").style.display = "none";
  document.getElementById("qrContainer").style.display = "none";
}

// ===== Utilidades UI =====
function mostrarErro(input, mensagem) {
  input.classList.add("error");
  var erro = document.getElementById(input.id + "-error");
  if (erro) erro.textContent = mensagem;
}
function limparErros() {
  document.querySelectorAll("input, select").forEach(c => c.classList.remove("error"));
  document.querySelectorAll(".error-message").forEach(m => m.textContent = "");
}
function copiarTexto(id) {
  var input = document.getElementById(id);
  input.select();
  document.execCommand("copy");
  alert("Copiado!");
}

// ===== Toggle de modo =====
function onChangeModo() {
  var modo = getModo();
  var utmFields = document.querySelectorAll(".utm-only");
  var btnGerar = document.getElementById("btnGerar");
  var resultado = document.getElementById("resultado");
  var label = document.getElementById("labelUrlGerada");

  if (modo === "quick") {
    utmFields.forEach(el => el.style.display = "none");
    btnGerar.style.display = "none";
    resultado.style.display = "block";
    label.textContent = "URL de Entrada:";
    document.getElementById("urlGerada").value = document.getElementById("url").value.trim();
    document.getElementById("shortContainer").style.display = "none";
    document.getElementById("qrContainer").style.display = "none";
  } else {
    utmFields.forEach(el => el.style.display = "");
    btnGerar.style.display = "";
    resultado.style.display = "none";
    document.getElementById("urlGerada").value = "";
  }
}

// ===== Encurtar via Apps Script =====
var encurtando = false;
function setShorteningUI(isLoading, text) {
  var shortContainer = document.getElementById("shortContainer");
  var urlCurta = document.getElementById("urlCurta");
  var btnShorten = document.getElementById("btnShorten");

  shortContainer.style.display = "block";
  if (isLoading) {
    encurtando = true;
    btnShorten.disabled = true;
    btnShorten.textContent = "Encurtando…";
    urlCurta.classList.add("loading");
    urlCurta.disabled = true;
    urlCurta.value = text || "Encurtando sua URL…";
  } else {
    encurtando = false;
    btnShorten.disabled = false;
    btnShorten.textContent = "Encurtar URL";
    urlCurta.classList.remove("loading");
    urlCurta.disabled = false;
    if (text) urlCurta.value = text;
  }
}

async function encurtarURLUnified() {
  if (encurtando) return;
  var modo = getModo();
  var baseUrl = document.getElementById("url").value.trim();

  if (!/^https?:\/\//.test(baseUrl)) {
    document.getElementById("url-error").textContent = "Insira uma URL válida iniciando com http(s)://";
    return;
  } else {
    document.getElementById("url-error").textContent = "";
  }

  var urlParaEncurtar = baseUrl;
  if (modo === "param") {
    if (!ultimaURL) { alert("Clique em Gerar URL antes de encurtar."); return; }
    urlParaEncurtar = ultimaURL;
  } else {
    document.getElementById("resultado").style.display = "block";
    document.getElementById("labelUrlGerada").textContent = "URL de Entrada:";
    document.getElementById("urlGerada").value = baseUrl;
  }

  try {
    setShorteningUI(true, "Encurtando sua URL…");
    // usa x-www-form-urlencoded para evitar preflight/CORS
    var body = new URLSearchParams({
      originalURL: urlParaEncurtar,
      destino: getDestino() // "nav" ou "sites"
    });
 

    var res = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
    var data = await res.json();
    console.log("[front] resposta GAS:", data);
    if (data && data.shortURL) setShorteningUI(false, data.shortURL);
    else throw new Error((data && data.error) || "Resposta inválida do backend");
  } catch (e) {
    console.error(e);
    setShorteningUI(false, "Erro: " + (e.message || "Falha ao encurtar"));
  }
}

// ===== QR Code =====
function gerarQRCodeUnified() {
  var modo = getModo();
  var baseUrl = document.getElementById("url").value.trim();
  if (!/^https?:\/\//.test(baseUrl)) {
    document.getElementById("url-error").textContent = "Insira uma URL válida iniciando com http(s)://";
    return;
  } else {
    document.getElementById("url-error").textContent = "";
  }

  var dataUrl = (modo === "param") ? (ultimaURL || baseUrl) : baseUrl;
  if (modo === "param" && !ultimaURL) {
    alert("Clique em Gerar URL antes de gerar o QR.");
    return;
  }

  document.getElementById("resultado").style.display = "block";
  if (modo !== "param") {
    document.getElementById("labelUrlGerada").textContent = "URL de Entrada:";
    document.getElementById("urlGerada").value = baseUrl;
  }

  document.getElementById("qrContainer").style.display = "block";
  qrCode = new QRCodeStyling({
    width: 250,
    height: 250,
    data: dataUrl,
    image: "logo-dasa.png",
    dotsOptions: { color: "#000000", type: "rounded" },
    imageOptions: { margin: 10, imageSize: 0.35 }
  });
  var qrDiv = document.getElementById("qrcode");
  qrDiv.innerHTML = "";
  qrCode.append(qrDiv);
}

function baixarQRCode() {
  if (!qrCode) { alert("Gere o QR Code primeiro."); return; }
  var formato = document.getElementById("formatoDownload").value;
  qrCode.download({ name: "qrcode", extension: formato });
}
