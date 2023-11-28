import { DefDevelop } from "./ConstantDefine";
import { findMusicInfo } from "./textalive/MusicInfo";
import { TextAlivePlayer, TextAlivePlayerArray } from "./textalive/TextAlivePlayer";

class Main {
    private _mainSequence: MainSequence;

    public constructor() {
        this._mainSequence = new MainSequence();
    }

    public initialize(): void {
        this._mainSequence.initialize();
    }
}

type MainSequenceState = "new" | "initializing" | "ready" | "playing" | "finished" | "delete";

class MainSequence {
    private _multiPlayer: TextAlivePlayerArray;
    private _loadingPlayerIndex: number;

    private _status: MainSequenceState;

    public constructor() {
        this._multiPlayer = new TextAlivePlayerArray();
        this._loadingPlayerIndex = 0;
        this._status = "new";
        console.info(this._status)
    }

    public restart(): void {
        this._multiPlayer.restart();

        this._status = "ready";
        console.info(this._status)
    }

    public initialize(): void {
        for (var i = 0; i < DefDevelop.Info.MUSIC_NUM; i++) {
            this._multiPlayer.push(new TextAlivePlayer());
        }
        this._multiPlayer[0].initialize(findMusicInfo(0));

        const container = document.getElementById("canvas-container")!;
        container.addEventListener("click", (event) => this.click(event));
        // --------------------------------
        this._status = "initializing";
        console.info(this._status)

        this.update();
    }

    private isInitialized(): boolean {
        if (this._loadingPlayerIndex < this._multiPlayer.length && !this._multiPlayer[this._loadingPlayerIndex].isInitialized()) {
            return false;
        } else {
            // 次の Player を初期化
            this._loadingPlayerIndex++;
            if (this._loadingPlayerIndex < this._multiPlayer.length) {
                this._multiPlayer[this._loadingPlayerIndex].initialize(findMusicInfo(this._loadingPlayerIndex));
                return false;
            }
        }
        return true;
    }

    private isFinished(): boolean {
        return this._multiPlayer[0].isFinished();
    }

    public update(): void {
        requestAnimationFrame(() => {
            this.update();
        });

        if (this._status == "new" || this._status == "initializing") {
            // 初期化開始
        }
        if (this._status == "initializing" && this.isInitialized()) {
            // 初期化完了（スタート待ち）
            this._status = "ready";
            console.info(this._status);
        }

        if (this._status == "playing" && this.isFinished()) {
            // 曲終了
            this._status = "finished";
            console.info(this._status);
        }

        // switchMs の間隔で再生する Player を切り替える
        const switchMs = 5000;
        const fadeoutRate = 0.2;
        const nowRate = (this._multiPlayer[0].position % switchMs) / switchMs;
        const playIndex = Math.floor(this._multiPlayer[0].position / switchMs) % this._multiPlayer.length;
        const nextIndex = (playIndex + 1) % this._multiPlayer.length;
        this._multiPlayer.forEach((player, index) => {
            // console.info(`player[${index}].position     : ${this._multiPlayer[index].position}`); // onTimeUpdate() で更新している position
            // console.info(`player[${index}].timerPosition: ${this._multiPlayer[index].timerPosition}`);  // Player.timer.position
            let vol = 0.0;
            switch (index) {
                case playIndex:
                    vol = (nowRate < 1.0 - fadeoutRate) ? 1.0 : (1.0 - ((nowRate - (1.0 - fadeoutRate)) / fadeoutRate));
                    break;
                case nextIndex:
                    vol = (nowRate < 1.0 - fadeoutRate) ? 0.0 : ((nowRate - (1.0 - fadeoutRate)) / fadeoutRate);
                    break;
                default:
                    break;
            }
            player.setVolume(vol * 100);
        });
    }

    private click(event: MouseEvent): void {
        if (this._status == "ready") {
            if (this._multiPlayer.requestPlayAll()) {
                this._status = "playing";
                console.info(this._status)
            } else {
                console.warn(`player.requestPlay() に失敗`);
            }
        }

        if (this._status == "finished") {
            this.restart();
            this._status = "ready";
            console.info(this._status)
        }
    }
}

const main = new Main();
main.initialize();
