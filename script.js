let $scoreRef,
  $quizz,
  $init,
  $userData,
  $user,
  $menu,
  $time,
  $text,
  $options,
  $totalTime,
  $totalCorrect,
  $totalWrong,
  $myRank,
  $rank;

const arrGif = [1, 2, 3, 4, 5, 6];

let global = {
  quests: 10,
  data: [],
  correct: "",
  refTime: "",
  time: 15,
  score: 0,
  totalTime: 0,
  refTotalTime: 0,
  totalCorrectAnswer: 0,
  totalNumberOfQuests: 10,
};

document.addEventListener("DOMContentLoaded", () => {
  $scoreRef = document.querySelector(".score-ref");
  $quizz = document.querySelector(".quizz");
  $init = document.querySelector(".init");
  $userData = document.querySelector("#userData");
  $user = document.querySelector("#userName");
  $menu = document.querySelector(".menu");
  $time = document.querySelector("#time");
  $text = document.getElementById("text");
  $options = document.getElementById("options");
  $gif = document.getElementById("gif-img");
  $totalTime = document.getElementById("total-Time");
  $totalCorrect = document.getElementById("total-Correct");
  $totalWrong = document.getElementById("total-Wrong");
  $myRank = document.getElementById("myRank");
  $rank = document.getElementById("rank");
});

function handleDisabledUser() {
  $init.classList.toggle("hidde");

  $userData.classList.toggle("hidde");
}

function handleLocalStorage() {
  window.localStorage.setItem("nickName", $user.value);

  $menu.classList.toggle("hidde");

  $quizz.classList.toggle("hidde");

  handleRequestApi();
}

function handleRequestApi() {
  const url = "https://opentdb.com/api.php?amount=10&category=23";

  fetch(url, {
    method: "GET",
    mode: "cors", // pode ser cors ou basic(default)
  })
    .then((res) => res.json())
    .then((json) => {
      const { results } = json;
      handleQuests(results);
    })
    .catch(function (err) {
      console.error("Failed retrieving information", err);
      alert("Error na requisição, contate o administrador");
    });
}

function handleTime() {
  global.time = 15;
  $time.style.display = "block";
  $time.innerText = global.time;

  global.refTime = setInterval(() => {
    global.time--;
    $time.innerText = global.time;
    if (global.time === 0) {
      handleQuests();
    }
  }, 1000);
}

function handleQuests(params = 0) {
  // trata parametros
  if (params) {
    global.data = params;
    handleTotalTime(true);
  }
  clearInterval(global.refTime);
  handleTime();

  if (global.quests == 0) {
    handleScore();

    return;
  }

  const { question, incorrect_answers, correct_answer } = global.data[
    global.quests - 1
  ];
  global.correct = correct_answer;
  $text.innerText = question;
  let html = "";
  const myArr = shuffle([...incorrect_answers, correct_answer]);
  myArr.forEach((element) => {
    html += `<div onclick="handleAnswer(this.innerText, this)" >${element}</div>`;
  });
  $options.innerHTML = html;

  console.log("chamou", global.quests);
  console.log("data", global.data[global.quests - 1]);
  global.quests--;
}

function handleAnswer(resposta, element) {
  clearInterval(global.refTime);

  document.querySelectorAll(".options div").forEach((element) => {
    element.onclick = function () {
      return false;
    };
    element.style.animation = "none";
  });

  if (resposta == global.correct) {
    runAudio("./assets/Audio/correct/audio1.m4a");
    element.style.background = "rgb(74, 207, 74)";

    global.score += 10;
    global.score += global.time;
    global.totalCorrectAnswer++;

    $gif.classList.remove("hidde");
    $gif.src = `assets/happy/gif${shuffle(arrGif)[1]}.gif`;
    setTimeout(() => {
      $gif.classList.add("hidde");

      handleQuests();
      if (global.quests == 0) {
        handleScore();
      }
    }, 3000);
  } else {
    runAudio("./assets/Audio/wrong/audio1.m4a");
    element.style.background = "rgb(236, 45, 45)";

    $gif.classList.remove("hidde");
    $gif.src = `assets/sad/gif${shuffle(arrGif)[1]}.gif`;
    setTimeout(() => {
      $gif.classList.add("hidde");

      if (global.quests == 0) {
        handleScore();
      }
      handleQuests();
    }, 3000);
  }
}

function shuffle(o) {
  for (
    var j, x, i = o.length;
    i;
    j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x
  );
  return o;
}

function handleScore() {
  clearInterval(global.refTime);
  handleTotalTime();

  addToRank();
  document.querySelector("#pontos").innerText = `${global.score}`;
  $totalTime.innerText = global.totalTime > 150 ? 150 : global.totalTime;
  $totalCorrect.innerText = global.totalCorrectAnswer;
  $totalWrong.innerText =
    global.totalNumberOfQuests - global.totalCorrectAnswer;

  $scoreRef.classList.remove("hidde");
  $time.innerText = "";

  $quizz.classList.add("hidde");
}

function handleRestart() {
  handleRequestApi();
  $scoreRef.classList.toggle("hidde");
  $quizz.classList.toggle("hidde");

  global = {
    quests: 10,
    data: [],
    correct: "",
    refTime: "",
    time: 15,
    score: 0,
    totalTime: 0,
    refTotalTime: 0,
    totalCorrectAnswer: 0,
    totalNumberOfQuests: 10,
  };
}

function handleTotalTime(param = false) {
  if (param) {
    global.refTotalTime = setInterval(() => {
      global.totalTime++;
    }, 1000);
  } else {
    clearInterval(global.refTotalTime);
  }
}

function addToRank() {
  const nickName = window.localStorage.getItem("nickName");

  const obj = {
    nickName,
    totalTime: global.totalTime,
    score: global.score,
    totalCorrectAnswer: global.totalCorrectAnswer,
  };

  const rank = JSON.parse(window.localStorage.getItem("rank"));
  const rankRef = rank == null ? [] : rank;
  window.localStorage.setItem("rank", JSON.stringify([...rankRef, obj]));
}

function handleRank(param = true) {
  if (param) {
    $rank.classList.toggle("hidde");
    $menu.classList.toggle("hidde");
  } else {
    $rank.classList.toggle("hidde");
    $scoreRef.classList.toggle("hidde");
  }

  const rank = JSON.parse(window.localStorage.getItem("rank"));
  let html = "";
  let rankRef = rank.sort(function (a, b) {
    return a.score < b.score ? 1 : b.score < a.score ? -1 : 0;
  });
  rankRef.forEach((element, index) => {
    if (index < 5) {
      html += `<tr>
      <td>${index + 1}</td>
      <td>${element.nickName}</td>
      <td>${element.score}</td>
      <td>${element.totalTime}</td>
      </tr>`;
    }
  });
  $myRank.innerHTML = html;
}

function runAudio(param) {
  var audio = new Audio(param);
  audio.addEventListener("canplaythrough", function () {
    audio.play();
  });
}
function handleBack() {
  if (global.totalTime) {
    $rank.classList.toggle("hidde");
    $scoreRef.classList.toggle("hidde");
  } else {
    $rank.classList.toggle("hidde");
    $menu.classList.toggle("hidde");
  }
}
