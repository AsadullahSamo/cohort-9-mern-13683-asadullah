const Note = require("../models/Note")

const getNotes = async (req, res) => {
    const search = req.query.search;

    let query = { user: req.userId };

    if (search) {
        const regex = new RegExp(search, "i");

        query = {
            user: req.userId,
            $or: [ { title: regex }, { content: regex } ]
        };
    }

    const notes = await Note.find(query).sort({ updatedAt: -1 });
    res.json(notes);
};

const getNoteById = async (req, res) => {
    const note = await Note.findOne({_id: req.params.id, user: req.userId});

    if(!note) {
        return res.status(404).json({error: "Note not found"});
    }

    res.json(note);
}

const createNote = async (req, res) => {
    const {title, content} = req.body;

    if(!title || !content) {
        return res.status(400).json({error: "Title and content are required"});
    }

    const note = await Note.create({title, content, user: req.userId});
    res.status(201).json(note);
}

async function updateNote(req, res) {
  const { title, content } = req.body;

  if (title === undefined && content === undefined) {
    return res.status(400).json({ error: "At least one of title or content is required" });
  }

  const updates = {};
  if (title !== undefined) updates.title = title;
  if (content !== undefined) updates.content = content;

  const note = await Note.findOneAndUpdate(
    { _id: req.params.id, user: req.userId },
    updates,
    { new: true }
  );

  if (!note) {
    return res.status(404).json({ error: "Note not found" });
  }

  res.json(note);
}


const deleteNote = async (req, res) => {
    const note = await Note.findOneAndDelete({_id: req.params.id, user: req.userId});

    if(!note) {
        return res.status(404).json({error: "Note not found"});
    }

    res.json({message: "Note deleted"});
}

module.exports = { getNotes, getNoteById, createNote, updateNote, deleteNote }