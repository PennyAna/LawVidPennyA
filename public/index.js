document.getElementById('profileBtn').addEventListener('click', changeProfileView);
const profile = document.getElementById('profileDiv');
function changeProfileView() {
    if (profile.className == 'hidden') {
        profile.className = 'visible';
    }
} 
// document.getElementById('').addEventListener('click', afunction);
// function afunction() {

// }
