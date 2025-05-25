let notes = JSON.parse(localStorage.getItem("notes")) || [];
let currentIndex = 0;

const menuBtn = document.getElementById("menu-button");
const sidebar = document.getElementById("sidebar");
const addBtn = document.getElementById("add-note");
const deleteBtn = document.getElementById("delete-note");
const noteList = document.getElementById("note-list");
const noteTitle = document.getElementById("note-title");
const noteContent = document.getElementById("note-content");

menuBtn.onclick = () => sidebar.classList.toggle("hidden");

addBtn.onclick = () => {
  const newNote = { title: "新しいメモ", content: "" };
  notes.push(newNote);
  currentIndex = notes.length - 1;
  saveAndRender();
};

deleteBtn.onclick = () => {
  if (notes.length > 0) {
    notes.splice(currentIndex, 1);
    currentIndex = Math.max(0, currentIndex - 1);
    saveAndRender();
  }
};

noteTitle.oninput = () => {
  notes[currentIndex].title = noteTitle.value;
  saveNotes();
  renderNoteList();
};

noteContent.oninput = () => {
  notes[currentIndex].content = noteContent.value;
  saveNotes();
};

function saveNotes() {
  localStorage.setItem("notes", JSON.stringify(notes));
}

function renderNoteList() {
  noteList.innerHTML = "";
  notes.forEach((note, index) => {
    const li = document.createElement("li");
    li.textContent = note.title || "無題";
    li.className = index === currentIndex ? "active" : "";
    li.onclick = () => {
      currentIndex = index;
      renderMain();
      renderNoteList();
    };
    noteList.appendChild(li);
  });
}

function renderMain() {
  if (notes.length === 0) {
    noteTitle.value = "";
    noteContent.value = "";
  } else {
    noteTitle.value = notes[currentIndex].title;
    noteContent.value = notes[currentIndex].content;
  }
}

function saveAndRender() {
  saveNotes();
  renderNoteList();
  renderMain();
}

// 初期化
if (notes.length === 0) {
  notes.push({ title: "おはようメモ", content: "メモはここに保存されるよ" });
}
saveAndRender();
