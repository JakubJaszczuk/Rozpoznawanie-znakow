// Załączanie potrzebnych obiektów
let express = require("express");
let bodyParser = require("body-parser");
let childProcess = require("child_process");

const hostname = "127.0.0.1";
const port = 8000;

// Serwer uzywając Express
let app = express();
app.listen(port, hostname, () => console.log(`Server running at http://${hostname}:${port}/`));

// Ustaw skąd express ma brać pliki do wysłania
app.use(express.static("public"));
// Express ma też używać jsona do parsowania request.body
app.use(express.json());
app.use(bodyParser.raw());

// Ustawienie handlera dla zapytania GET na adres "/" -> wysłanie strony głównej(css i js same się pobiorą)
app.get("/", (req, res) => res.sendFile("public/index.html"));

// Express sam chce pobierać ikonkę ale jej nie ma
app.get("/favicon.ico", (req, res) => res.status(204));

app.post("/predict", (req, res) => {
	const proc = childProcess.spawn("python", ["./main.py"]);
	// Przekieruj stderr dziecka na stderr rodzica
	proc.stderr.pipe(process.stderr);
	// Napisz dane bezpośrednio do strumienia wejściowego dziecka
	proc.stdin.write(req.body);
	proc.stdout.on("data", (data) => {
		res.send(data.toString("utf8"));
	});
});
