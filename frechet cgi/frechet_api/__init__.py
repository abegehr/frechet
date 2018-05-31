from flask import Flask

app = Flask(__name__)


@app.route("/frechet/api", methods=['GET', 'POST'])
def index():
    return "Hello, World! 5"

if __name__ == "__main__":
    app.run(debug=True)
