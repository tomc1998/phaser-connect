const Phaser = require('phaser');

let config = {
    width: 800,
    height: 600,
    type: Phaser.AUTO,
    parent: 'phaser-example',
    scene: {
        create: create
    }
};

let game = new Phaser.Game(config);

const NODE_STATE_ACTIVE = 'active';
const NODE_STATE_HOVER = 'hover';
const NODE_STATE_IDLE = 'idle';

let nodePairs = [];

function Node(scene, x, y, col) {
    let n = scene.add.circle(x, y, 12, col);
    n.state = NODE_STATE_IDLE;

    n.tweenRadius = r => {
        scene.tweens.add({
            targets: n,
            radius: r,
            ease: 'Quart.easeOut',
            duration: 200,
        });
    }

    n.enlarge = () => { n.tweenRadius(16); }
    n.resetSize = () => { n.tweenRadius(12); }
    n.shrink = () => { n.tweenRadius(4); }

    return n;
}

function createNodes(scene, x0, y0, x1, y1, col) {
    let n0 = new Node(scene, x0, y0, col);
    let n1 = new Node(scene, x1, y1, col);
    nodePairs.push([n0, n1]);
}

// Returns a node which has the given point inside it, or null.
function findIntersectingNode(x, y) {
    function testNode(n) {
        let dis2 = (n.x - x) * (n.x - x) + (n.y - y) * (n.y - y);
        return dis2 < n.radius * n.radius;
    }
    for (let [n0, n1] of nodePairs) {
        if (testNode(n0)) { return n0; }
        else if (testNode(n1)) { return n1; }
    }
    return null;
}

function create () {
    createNodes(this, 100, 200, 300, 400, 0xff0000);

    let currLine = null;
    let currActive = null;
    // If non-null, will be the node that the line should be 'clipped' to, to
    // show what will be drawn on release
    let currClip = null;

    function updateTweens() {
        for (let pair of nodePairs) {
            for (let n of pair) {
                if (n.state == NODE_STATE_HOVER) { n.enlarge(); }
                else if (n.state == NODE_STATE_IDLE) { n.resetSize(); }
                else if (n.state == NODE_STATE_ACTIVE) { n.shrink(); }
            }
        }
    }

    this.input.on('pointerdown', e => {
        let intersect = findIntersectingNode(e.x, e.y)
        if (intersect) {
            intersect.state = NODE_STATE_ACTIVE;
            currActive = intersect;
            currLine = this.add.line(0, 0, intersect.x, intersect.y, e.x, e.y, 0xff0000);
            updateTweens();
        }
    });

    this.input.on('pointerup', e => {
        if (currActive) {
            currActive.state = NODE_STATE_IDLE;
            currLine.destroy();
        }
        currLine = null;
        currActive = null;
        updateTweens();
    });

    this.input.on('pointermove', e => {
        if (currLine) {
            if (currClip) { currLine.setTo(currActive.x, currActive.y, currClip.x, currClip.y); }
            else { currLine.setTo(currActive.x, currActive.y, e.x, e.y); }
        }
        let intersecting = findIntersectingNode(e.x, e.y)
        if (intersecting && intersecting.state == NODE_STATE_IDLE) {
            if (currLine) { currClip = intersecting; }
            intersecting.state = NODE_STATE_HOVER;
        } else if (!intersecting) { currClip = null; }
        for (let pair of nodePairs) {
            for (let n of pair) {
                if (n != intersecting && n.state == NODE_STATE_HOVER) {
                    n.state = NODE_STATE_IDLE;
                }
            }
        }
        updateTweens();
    });
}
