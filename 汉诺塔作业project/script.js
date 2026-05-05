     // 游戏状态数据
let tower = [[], [], []];
let selectTower = null;
let moveTime = 0;
let diskNumber = 5;
let isAutoSolving = false;

// 获取页面元素
const numInput = document.getElementById("num");
const countText = document.getElementById("count");
const tipText = document.getElementById("tip");
const towersDom = document.querySelectorAll(".tower");

// 初始化游戏
function init(){
    moveTime = 0;
    countText.innerText = 0;
    tipText.innerText = "";
    selectTower = null;
    isAutoSolving = false;

    diskNumber = parseInt(numInput.value);
    // 限制圆盘数量在3-8之间
    if(diskNumber < 3) diskNumber = 3;
    if(diskNumber > 8) diskNumber = 8;
    numInput.value = diskNumber;

    tower = [[], [], []];
    // 给第一根柱子生成圆盘（数字越大，圆盘越大）
    for(let i = diskNumber; i >= 1; i--){
        tower[0].push(i);
    }
    render();
}

// 渲染页面圆盘
function render(){
    towersDom.forEach( (dom, index) => {
        dom.innerHTML = "";
        tower[index].forEach( size => {
            let div = document.createElement("div");
            div.className = "disk";
            div.dataset.size = size; // 给圆盘加size属性，方便区分颜色
            div.style.width = (40 + size * 25) + "px";
            dom.appendChild(div);
        })
    })
}

// 点击柱子的事件逻辑（选中圆盘 + 移动圆盘）
towersDom.forEach( (dom, index) => {
    dom.addEventListener("click", function(){
        // 自动解题中禁止操作
        if(isAutoSolving) return;

        // 第一次点击：选中圆盘
        if(selectTower === null){
            if(tower[index].length === 0) return;
            selectTower = index;
            // 给选中的圆盘加高亮效果
            let last = tower[selectTower].length - 1;
            towersDom[selectTower].children[last].classList.add("active");
        }
        // 第二次点击：移动圆盘
        else{
            let from = selectTower;
            let to = index;

            // 点击同一根柱子，取消选中
            if(from === to){
                selectTower = null;
                render();
                return;
            }

            let topDisk = tower[from].at(-1);
            let targetTop = tower[to].at(-1);

            // 判断移动是否合法（不能把大圆盘放在小圆盘上）
            if( targetTop < topDisk && targetTop !== undefined ){
                tipText.innerText = "❌ 不能把大圆盘放在小圆盘上面！";
                tipText.style.color = "red";
                selectTower = null;
                render();
                return;
            }

            // 执行合法移动
            tower[to].push( tower[from].pop() );
            moveTime++;
            countText.innerText = moveTime;
            selectTower = null;
            tipText.innerText = "";
            render();

            // 判断是否通关
            if(tower[2].length === diskNumber){
                tipText.innerText = "🎉 恭喜通关！作业完成！";
                tipText.style.color = "green";
            }
        }
    })
})

// 重置按钮事件
document.getElementById("reset").onclick = init;

// 修改圆盘数量时自动重置游戏
numInput.addEventListener("change", function(){
    if(!isAutoSolving){
        init();
    } else {
        tipText.innerText = "❌ 自动解题中不能修改圆盘数量！";
        tipText.style.color = "red";
        this.value = diskNumber;
    }
})

// 睡眠函数，实现自动解题的延迟效果
function sleep(t){
    return new Promise(res => setTimeout(res, t))
}

// 自动解题递归算法
async function move(n, a, b, c){
    if(n <= 0) return;
    await move(n-1, a, c, b);
    tower[b].push(tower[a].pop());
    moveTime++;
    countText.innerText = moveTime;
    render();
    await sleep(600); // 延迟0.6秒，圆盘多了也能看清步骤
    await move(n-1, c, b, a);
}

// 自动解题按钮事件
document.getElementById("auto").onclick = async function(){
    if(isAutoSolving) return;
    isAutoSolving = true;
    tipText.innerText = "🔄 自动解题中...";
    tipText.style.color = "#333";
    init();
    await move(diskNumber, 0, 2, 1);
    tipText.innerText = "✅ 自动解题完成！";
    tipText.style.color = "green";
    isAutoSolving = false;
}

// 页面加载完成后，初始化游戏
window.onload = init;