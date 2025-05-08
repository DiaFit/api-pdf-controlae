const express = require("express");
const cors = require("cors");
const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/gerar-pdf", async (req, res) => {
  try {
    const { transacoes = [], mes = "Maio", ano = "2025" } = req.body;
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    let y = 800;

    const draw = (text, x, y, size = 12) => {
      page.drawText(text, { x, y, size, font, color: rgb(0, 0, 0) });
    };

    draw(`Controlaê - Relatório Financeiro (${mes}/${ano})`, 150, y, 16);
    y -= 30;
    draw(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 50, y);
    y -= 30;
    draw("Categoria | Descrição | Valor | Data | Status", 50, y, 12);
    y -= 20;

    let totalReceitas = 0;
    let totalDespesas = 0;

    transacoes.forEach((t) => {
      const { category, description, amount, date, status, type } = t;
      const linha = `${category} | ${description || "-"} | R$ ${amount.toFixed(2)} | ${date} | ${status}`;
      draw(linha, 50, y, 10);
      y -= 15;
      if (type === "receita") totalReceitas += amount;
      if (type === "despesa") totalDespesas += amount;
    });

    y -= 20;
    draw(`Total Receitas: R$ ${totalReceitas.toFixed(2)}`, 50, y);
    y -= 15;
    draw(`Total Despesas: R$ ${totalDespesas.toFixed(2)}`, 50, y);
    y -= 15;
    draw(`Saldo Final: R$ ${(totalReceitas - totalDespesas).toFixed(2)}`, 50, y);

    const pdfBytes = await pdfDoc.save();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=relatorio_${mes}_${ano}.pdf`);
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao gerar PDF");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API rodando na porta ${PORT}`));
