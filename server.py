from flask import Flask, render_template

app = Flask(__name__)

# Route to serve the main index.html file
@app.route('/')
def index():
    return render_template("index.html")

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=8888)