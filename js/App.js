const gameArea = document.querySelector('.game-area');
const speed = document.querySelector('.speed');
const increase = document.querySelector('#increase');
const decrease = document.querySelector('#decrease');


class Snake {
    constructor(rootElement) {
        this.rootElement = rootElement;
        rootElement.addEventListener('click', event => this.mouseInput(event));
        this.head = this.createBlock();
        let side = getComputedStyle(this.head).height;
        side = parseInt(side);

        let {
            height,
            width
        } = getComputedStyle(rootElement);
        height = parseInt(height, 10);
        width = parseInt(width, 10);


        let food = document.createElement('div');
        food.classList.add('food');
        food.style.background = '#' + Math.floor(Math.random() * 16777215).toString(16);
        this.rootElement.appendChild(food);

        let collider = document.createElement('div');
        collider.classList.add('collider');
        this.rootElement.appendChild(collider);

        this.props = {
            bounds: {
                left: 0,
                right: width,
                top: 0,
                bottom: height,
                side,
            },
            keyMap: {
                68: 'right',
                65: 'left',
                87: 'up',
                83: 'down'
            }
        }
        this.state = {
            blocks: [this.head, this.createBlock(), this.createBlock()],
            position: {
                x: width / 2,
                y: height / 2
            },
            pressedKeys: {
                left: false,
                right: false,
                up: false,
                down: false
            },
            direction: 'right',
            speed: side,
            hasGotInput: false,
            hasMoved: false,
            food: food,
            collider: collider,
        }
        rootElement.addEventListener('keydown', event => this.keyDown(event));
        rootElement.addEventListener('keyup', event => this.keyUp(event));
        this.update();
        this.spawnFood()
    }

    mouseInput(event) {
        const {
            bounds
        } = this.props;
        let {
            direction
        } = this.state;
        let x = event.offsetX;
        let y = event.offsetY;

        if (x > bounds.right * 0.65 && direction !== 'left') {
            if (bounds.bottom * 0.3 < y < bounds.bottom * 0.7) {
                this.state.direction = 'right';
                this.state.hasGotInput = false;
            }
        } else if (x < bounds.right * 0.35 && direction !== 'right') {
            if (bounds.bottom * 0.3 < y < bounds.bottom * 0.7) {
                this.state.direction = 'left';
                this.state.hasGotInput = false;
            }
        }

        if (y > bounds.bottom * 0.65 && direction !== 'up') {
            if (bounds.right * 0.3 < x < bounds.right * 0.7) {
                this.state.direction = 'down';
                this.state.hasGotInput = false;
            }
        } else if (y < bounds.bottom * 0.35 && direction !== 'down') {
            if (bounds.bottom * 0.3 < x < bounds.bottom * 0.7) {
                this.state.direction = 'up';
                this.state.hasGotInput = false;
            }
        }
    }

    createBlock() {
        let sprite = document.createElement('div');
        sprite.classList.add('player');
        sprite.style.background = '#' + Math.floor(Math.random() * 16777215).toString(16);
        sprite.style.top = '-5000px';
        this.rootElement.appendChild(sprite);
        return sprite;
    }

    spawnFood() {
        this.state.food.style.background = '#' + Math.floor(Math.random() * 16777215).toString(16);
        this.state.food.style.borderColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
        let gridX = this.props.bounds.right / this.props.bounds.side;
        let gridY = this.props.bounds.bottom / this.props.bounds.side;
        let x = Math.floor(Math.random() * gridX);
        let y = Math.floor(Math.random() * gridY);
        x = x * this.props.bounds.side;
        y = y * this.props.bounds.side;
        this.state.food.style.left = `${x}px`;
        this.state.food.style.top = `${y}px`;

    }

    update() {
        let {
            pressedKeys,
            direction,
            hasGotInput,
            hasMoved
        } = this.state;
        let {
            bounds
        } = this.props;
        if (hasGotInput) {
            if (pressedKeys['left'] && direction !== 'right') {
                this.state.direction = 'left';
                this.state.hasGotInput = false;
            }

            if (pressedKeys['right'] && direction !== 'left') {
                this.state.direction = 'right';
                this.state.hasGotInput = false;
            }

            if (pressedKeys['up'] && direction !== 'down') {
                this.state.direction = 'up';
                this.state.hasGotInput = false;
            }

            if (pressedKeys['down'] && direction !== 'up') {
                this.state.direction = 'down';
                this.state.hasGotInput = false;
            }
        }
        if (hasMoved) {
            this.state.blocks[this.state.blocks.length - 1].style.left = `${this.state.position.x}px`;
            this.state.blocks[this.state.blocks.length - 1].style.top = `${this.state.position.y}px`;
            let BLOCK = this.state.blocks.pop();
            this.state.blocks.unshift(BLOCK);
            this.state.hasMoved = false;
        }

        let {
            x,
            y
        } = this.state.position;
        if (x < bounds.left)
            this.state.position.x = bounds.right - bounds.side;
        else if (x > bounds.right - bounds.side)
            this.state.position.x = bounds.left;

        if (y < bounds.top)
            this.state.position.y = bounds.bottom - bounds.side;
        else if (y > bounds.bottom - bounds.side)
            this.state.position.y = bounds.top;
  
        if (this.isEaten()) {
            this.spawnFood();
            let block = this.createBlock();
            this.state.blocks.push(block);
        }

        this.state.blocks.map((block, i) => {
            if (i > 2) 
                if (this.isColliding(this.state.collider, block)) 
                    this.rebirthSnake();
        });

        this.state.collider.style.left = `${this.state.position.x}px`;
        this.state.collider.style.top = `${this.state.position.y}px`;
    }

    rebirthSnake() {
        this.rootElement.classList.toggle('game-area-restart');
        for (let i = this.state.blocks.length; i > 3; i--) {
            let block = this.state.blocks.pop();
            block.remove();
        }
    }

    draw() {
        let {
            speed
        } = this.state;
        switch (this.state.direction) {
            case 'left':
                this.moveBy(-speed, 0);
                break;
            case 'right':
                this.moveBy(speed, 0);
                break;
            case 'up':
                this.moveBy(0, -speed);
                break;
            case 'down':
                this.moveBy(0, speed);
                break;
            default:
                break;
        }
        this.state.hasGotInput = true;
        this.state.hasMoved = true;
    }

    moveBy(x, y) {
        this.state.position.x += x;
        this.state.position.y += y;
    }

    keyUp(event) {
        let key = this.props.keyMap[event.which];
        this.state.pressedKeys[key] = false
    }

    keyDown(event) {
        let key = this.props.keyMap[event.which];
        this.state.pressedKeys[key] = true;
    }

    isEaten() {
        let head = this.state.blocks[0].getBoundingClientRect();
        let food = this.state.food.getBoundingClientRect();

        return !(
            ((head.top + head.height) < (food.top)) ||
            (head.top > (food.top + food.height)) ||
            ((head.left + head.width) < food.left) ||
            (head.left > (food.left + food.width))
        );
    }

    isColliding(a, b) {
        return !(
            ((a.style.top + a.style.height) < (b.style.top)) ||
            (a.style.top > (b.style.top + b.style.height)) ||
            ((a.style.left + a.style.width) < b.style.left) ||
            (a.style.left > (b.style.left + b.style.width))
        );
    }

}



function updateInterval() {
    speed.textContent = Math.floor(10000 / interval);
}

let daddy = new Snake(gameArea);

var now;
var then = Date.now();
var interval = 80;
var delta;

updateInterval();

decrease.addEventListener('click', () => {
    interval += 20;
    if (interval > 500) interval = 500;
    updateInterval();
});

increase.addEventListener('click', () => {
    interval -= 20;
    if (interval < 20) interval = 20;
    updateInterval();
});

(function () {
    function main() {
        window.requestAnimationFrame(main);
        now = Date.now();
        delta = now - then;

        daddy.update();

        if (delta > interval) {
            then = now - (delta % interval);
            daddy.draw();
        }
    }
    main();
})();