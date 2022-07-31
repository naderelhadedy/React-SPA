from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from flask_cors import CORS


app = Flask(__name__)
CORS(app)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root:''@localhost/flaskreact'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
ma = Marshmallow(app)


class Articles(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    lines = db.Column(db.Integer)
    words = db.Column(db.Integer)

    def __init__(self, name, lines, words):
        self.name = name
        self.lines = lines
        self.words = words


class ArticleSchema(ma.Schema):
    class Meta:
        fields = ('id', 'name', 'lines', 'words')


article_schema = ArticleSchema()
articles_schema = ArticleSchema(many=True)


@app.route('/', methods=['GET'])
def home():
    return '<h1>Welcome to Articles Analyzer</h1>'


@app.route('/get', methods=['GET'])
def get_articles():
    all_articles = Articles.query.all()
    results = articles_schema.dump(all_articles)
    return jsonify(results)


@app.route('/add', methods=['POST'])
def add_article():
    name = 'article.pdf'  # request.json['name']
    lines = 25  # request.json['lines']
    words = 286  # request.json['words']

    articles = Articles(name, lines, words)
    db.session.add(articles)
    db.session.commit()
    return article_schema.jsonify(articles)


if __name__ == '__main__':
    app.run(debug=True)
