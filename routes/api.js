'use strict';

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_DB);

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  comments: { type: Array, default: [] }
});

const Book = mongoose.model('Book', bookSchema);

module.exports = function (app) {

  app.route('/api/books')
    .get(async function (req, res) {
      try {
        const books = await Book.find();
        res.json(books.map(book => ({
          _id: book._id,
          title: book.title,
          commentcount: book.comments.length
        })));
      } catch (err) {
        res.status(500).send(err.message);
      }
    })
    
    .post(async function (req, res) {
      const title = req.body.title;
      if (!title) {
        return res.send('missing required field title');
      }
      try {
        const newBook = new Book({ title });
        await newBook.save();
        res.json({ _id: newBook._id, title: newBook.title });
      } catch (err) {
        res.status(500).send(err.message);
      }
    })
    
    .delete(async function (req, res) {
      try {
        await Book.deleteMany();
        res.send('complete delete successful');
      } catch (err) {
        res.status(500).send(err.message);
      }
    });

  app.route('/api/books/:id')
    .get(async function (req, res) {
      const bookid = req.params.id;
      if (!mongoose.Types.ObjectId.isValid(bookid)) {
        return res.send('no book exists');
      }
      try {
        const book = await Book.findById(bookid);
        res.json({
          _id: book._id,
          title: book.title,
          comments: book.comments
        });
      } catch (err) {
        res.status(500).send(err.message);
      }
    })
    
    .post(async function (req, res) {
      const bookid = req.params.id;
      const comment = req.body.comment;
      if (!comment) {
        return res.send('missing required field comment');
      }
      if (!mongoose.Types.ObjectId.isValid(bookid)) {
        return res.send('no book exists');
      }
      try {
        const book = await Book.findById(bookid);
        book.comments.push(comment);
        await book.save();
        res.json({
          _id: book._id,
          title: book.title,
          comments: book.comments
        });
      } catch (err) {
        res.status(500).send(err.message);
      }
    })
    
    .delete(async function (req, res) {
      const bookid = req.params.id;
      if (!mongoose.Types.ObjectId.isValid(bookid)) {
        return res.send('no book exists');
      }
      try {
        res.send('delete successful');
      } catch (err) {
        res.status(500).send(err.message);
      }
    });

};
