const loginScreen = document.getElementById("login-screen");
const app = document.getElementById("app");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginButton = document.getElementById("login-button");
const registerButton = document.getElementById("register-button");
const loginMessage = document.getElementById("login-message");
const currentUserSpan = document.getElementById("current-user");
const signoutButton = document.getElementById("signout-button");
const memoListDiv = document.getElementById("memo-list");
const addMemoButton = document.getElementById("add-memo-button");
const memoContent = document.getElementById("memo-content");

let data = null;
let currentMemoIndex = null;

const STORAGE_KEY = "memoAppData";

async function sha256(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2,'0')).join('');
}

function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if(raw) return JSON.parse(raw);
  else return { users: {}, currentUser: null };
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loginSuccess(username) {
  data.currentUser = username;
  saveData();
  loginScreen.style.display = "none";
  app.style.display = "block";
  currentUserSpan.textContent = username;
  loadUserNotes();
}

async function registerUser() {
  const username = usernameInput.value.trim();
  const password = passwordInput.value;
  loginMessage.textContent = "";
  if(!username || !password) {
    loginMessage.textContent = "ユーザー名とパスワードを入力してください";
    return;
  }
  if(data.users[username]) {
    loginMessage.textContent = "そのユーザー名はすでに使われています";
    return;
  }
  const hash = await sha256(password);
  data.users[username] = { passwordHash: hash, notes: [] };
  saveData();
  loginMessage.style.color = "green";
  loginMessage.textContent = "登録成功しました。ログインしてください。";
}

async function loginUser() {
  const username = usernameInput.value.trim();
  const password = passwordInput.value;
  loginMessage.textContent = "";
  if(!username || !password) {
    loginMessage.textContent = "ユーザー名とパスワードを入力してください";
    return;
  }
  if(!data.users[username]) {
    loginMessage.textContent = "ユーザーが存在しません";
    return;
  }
  const hash = await sha256(password);
  if(data.users[username].passwordHash !== hash) {
    loginMessage.textContent = "パスワードが違います";
    return;
  }
  loginSuccess(username);
}

function signOut() {
  data.currentUser = null;
  saveData();
  app.style.display = "none";
  loginScreen.style.display = "block";
  usernameInput.value = "";
  passwordInput.value = "";
  loginMessage.textContent = "";
  memoListDiv.innerHTML = "";
  memoContent.value = "";
}

function loadUserNotes() {
  const user = data.users[data.currentUser];
  memoListDiv.innerHTML = "";
  user.notes.forEach((note, i) => {
    const div = document.createElement("div");

    const titleInput = document.createElement("input");
    titleInput.type = "text";
    titleInput.className = "title";
    titleInput.value = note.title;
    titleInput.placeholder = "タイトルなし";
    titleInput.addEventListener("input", () => {
      note.title = titleInput.value;
      saveData();
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑 削除";
    deleteBtn.className = "delete-btn";
    deleteBtn.addEventListener("click", () => {
      if(confirm("このメモを削除しますか？")) {
        user.notes.splice(i,1);
        saveData();
        if(currentMemoIndex === i) {
          memoContent.value = "";
          currentMemoIndex = null;
        }
        loadUserNotes();
      }
    });

    div.appendChild(titleInput);
    div.appendChild(deleteBtn);

    div.addEventListener("click", () => {
      currentMemoIndex = i;
      memoContent.value = note.content;
    });

    memoListDiv.appendChild(div);
  });
}

function addNewMemo() {
  const user = data.users[data.currentUser];
  user.notes.push({title:"新しいメモ", content:""});
  saveData();
  loadUserNotes();
}

memoContent.addEventListener("input", () => {
  if(currentMemoIndex === null) return;
  const user = data.users[data.currentUser];
  user.notes[currentMemoIndex].content = memoContent.value;
  saveData();
});

loginButton.addEventListener("click", loginUser);
registerButton.addEventListener("click", registerUser);
signoutButton.addEventListener("click", signOut);
addMemoButton.addEventListener("click", addNewMemo);

(function(){
  data = loadData();
  if(data.currentUser && data.users[data.currentUser]) {
    loginSuccess(data.currentUser);
  }
})();
