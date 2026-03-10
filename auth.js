// ═══════════════════════════════════════════════════════════
// SKILLCHAIN AUTH SYSTEM
// ═══════════════════════════════════════════════════════════

const AuthSystem = (() => {

const DEFAULT_USERS = [
{ id:'USR-0001', username:'admin', password:'admin123', role:'admin', name:'System Administrator', email:'admin@skillchain.io', avatar:'🛡️', active:true },

{ id:'USR-0010', username:'arjun.sharma', password:'Arjun@2024', role:'student', name:'Arjun Sharma', email:'arjun@student.edu', avatar:'🎓', studentId:'STU-7841', active:true },

{ id:'USR-0011', username:'nayan.fulare', password:'Nayan@2024', role:'student', name:'Nayan Fulare', email:'nayan@student.edu', avatar:'🎓', studentId:'STU-7842', active:true },

{ id:'USR-0012', username:'tejashri.hipparge', password:'Tejashri@2024', role:'student', name:'Tejashri Hipparge', email:'tejashri@student.edu', avatar:'🎓', studentId:'STU-7843', active:true }
];

// Initialize users
function initUsers(){
if(!localStorage.getItem("sc_users")){
localStorage.setItem("sc_users",JSON.stringify(DEFAULT_USERS));
}
}

// Get users
function getUsers(){
initUsers();
return JSON.parse(localStorage.getItem("sc_users")) || [];
}

// Save users
function saveUsers(users){
localStorage.setItem("sc_users",JSON.stringify(users));
}

// Create session
function setSession(user){

const session={
userId:user.id,
username:user.username,
name:user.name,
role:user.role,
email:user.email,
avatar:user.avatar,
studentId:user.studentId || null,
loginTime:new Date().toISOString()
};

sessionStorage.setItem("sc_session",JSON.stringify(session));

return session;
}

// Get session
function getSession(){
const s=sessionStorage.getItem("sc_session");
return s ? JSON.parse(s) : null;
}

// Clear session
function clearSession(){
sessionStorage.removeItem("sc_session");
}

// Check login
function isLoggedIn(){
return !!getSession();
}

// Login function
function login(username,password){

const users=getUsers();

const user=users.find(
u=>(u.username===username || u.email===username) && u.password===password
);

if(!user){
return {success:false,error:"Invalid username or password"};
}

return {success:true,session:setSession(user)};
}

// Logout
function logout(){
clearSession();
window.location.href="auth.html";
}

// Require login
function requireAuth(redirect="auth.html"){

if(!isLoggedIn()){
window.location.href=redirect;
return null;
}

return getSession();
}

// Redirect if already logged in
function redirectIfLoggedIn(url){

if(isLoggedIn()){
window.location.href=url;
}

}

// Register user
function register(userData){

let users=getUsers();

// check if username exists
if(users.find(u => u.username === userData.username)){
return {success:false,error:"Username already exists"};
}

const newUser={
id:"USR-"+Date.now(),
username:userData.username,
password:userData.password,
name:userData.name,
email:userData.email,
role:"student",
avatar:"🎓",
studentId:"STU-"+Math.floor(Math.random()*9000+1000),
createdAt:new Date().toISOString(),
active:true
};

users.push(newUser);

saveUsers(users);

// after register → redirect to login
return {success:true,user:newUser};

}

// Navbar login display
function injectAuthNav(){

const nav=document.getElementById("authNavArea");

if(!nav) return;

const session=getSession();

if(session){

nav.innerHTML=`
<span style="color:white">👤 ${session.name}</span>
<button onclick="AuthSystem.logout()">Logout</button>
`;

}else{

nav.innerHTML=`
<a href="auth.html">Login</a>
`;

}

}

return{
getUsers,
saveUsers,
login,
logout,
register,
setSession,
getSession,
clearSession,
isLoggedIn,
requireAuth,
redirectIfLoggedIn,
injectAuthNav
};

})();
function handleRegister(){

const userData = {
    name: document.getElementById("regName").value,
    username: document.getElementById("regUsername").value,
    email: document.getElementById("regEmail").value,
    password: document.getElementById("regPassword").value
};

const result = AuthSystem.register(userData);

if(result.success){
    alert("Account created successfully!");
    window.location.href="auth.html";
}
else{
    alert(result.error);
}

}

window.AuthSystem=AuthSystem;