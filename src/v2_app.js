
// import jquery
import 'https://code.jquery.com/jquery-3.6.0.min.js'
import FDb from './v2_fdb.js'

let waktu = 60;
let timer = null
timer = setInterval(countdown, 1000);

function answererWidget(dataUser) {
    $("#userSekarang").html(`
       <div class="px-3 naga mb-4">
            <div class="card px2">
                <div class="row px-2 d-flex align-items-center">
                        <img class="p-2 col-4" src="${dataUser.User['profilePictureUrl']}" alt="Avatar" style="width:50px ; height: 50px; border-radius: 50%;" />
                        <div class="p-2 col-8">
                            <div class="text-dark naga" style="font-weight: bold">${dataUser.User['nickname']}</div>
                            <div>score: ${dataUser.User.Score[0].score}</div>
                        </div>
                </div>
            </div>
        </div>
    `);
}

async function getQuestion() {
   
    let data = await $.get('/question');
    $("#soal").html(data.soal);
    $("#clue").html(data.clue);
    console.log("get new question");
    
}
getQuestion();

async function getAnswerer(){
    let data = await $.get('/answerer')
    console.log(JSON.stringify(data));
    answererWidget(data)
}
getAnswerer();

async function GetTop10(){
    let data = await $.get('/top10');
    console.log(data)
    let isi = data.map((e) => {
        return `
       <div class="col-6 p-2">
             <div style="height: 65px" class="card  border border-white border-4 p-2 bg-warning">
                <div class="row">
                    <div class="col-4 ">
                        <img style="width: 100%; border-radius: 50%;" src="${e.User?.profilePictureUrl ?? ''}">
                        
                    </div>
                    <div style="font-size: 16px" class="naga p-2 col-8">${e.score}</div>
                </div>
            </div>
       </div>
        
        `
    })

    $('#top10').html(isi.join(''))
}
GetTop10();

function stop() {
    clearInterval(timer);
    timer = null;
    console.log("stop");
}

function start() {
    timer = setInterval(countdown, 1000);
    waktu = 60;
    console.log("start");
}

async function countdown() {
    if (waktu <= 0) {
        stop();
        await correctAnswer()
        await getQuestion();
        start();
    } else {
        waktu--;
        $("#countdown").html(waktu);
    }
}


async function correctAnswer() {
    
    let answer = await $.get('/correct');
    await Swal.fire({
        timer: 3000,
        color: '#FFFFFF',
        background: '#044769',
        showConfirmButton: false,
        showCloseButton: false,
        html: `<h1 class="text-white naga ">${answer}</h1>`
    })
}



// FDb.soal.onValue(x => console.log(x))
let random = Math.floor(Math.random() * 10) + 1;
FDb.event("top10").onChange(() => console.log("ini di onchange top 10" + random))

FDb.event("answerer").onChange(async() => {
    stop();
    let answer = await $.get('/correct');
    let answerer = await $.get('/answerer');
    await Swal.fire({
        timer: 3000,
        color: '#FFFFFF',
        background: '#7D1A73',
        showConfirmButton: false,
        showCloseButton: false,
        html: `<di class="p-2">
            <h4 class="naga text-white">Jawaban Benar</h4>
            <div class="p-2">
                <img class="p-2" src="${answerer.User.profilePictureUrl}" alt="Avatar" style="width:70px ; height: 70px; border-radius: 50%;" />
            </div>
            <div class="text-white naga" style="font-weight: bold">${answerer.User.nickname}</div>
            <h3 class="naga text-white">${answer}</h3>
        </di>`
    })
    await getAnswerer();
    await GetTop10();
    await getQuestion();

    start();
})


// FDb.event("question").onChange(async () => {
   
// })