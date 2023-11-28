import { IPlayerApp, IVideo, Player, Timer } from "textalive-app-api";
import { DefDevelop } from "../ConstantDefine";

import { MusicInfo } from "./MusicInfo";

import config = require("./dev_textalive_config.json"); // 開発用

export class TextAlivePlayer {
    private _player: Player;
    private _video: IVideo;
    private _position: number;
    private _musicInfo: MusicInfo;
    private _isReady: boolean;

    public constructor() {
        this._position = 0;
        this._isReady = false;
    }

    public initialize(param: MusicInfo): void {
        var element = document.createElement("div");
        element.id = `media_${param.id}`;
        element.hidden = !DefDevelop.Debug.USING_YOUTUBE_MEDIA;
        const mediaRootElement = document.querySelector<HTMLElement>("#media");
        mediaRootElement.appendChild(element);
        this._player = new Player({
            app: {
                token: config.textalive_token,
                appName: "TestApp",
            },
            valenceArousalEnabled: true,
            vocalAmplitudeEnabled: true,
            mediaElement: element,
        });
        this._musicInfo = param;

        this._player.addListener({
            onAppReady: (app) => this.onAppReady(app),
            onVideoReady: (v) => this.onVideoReady(v),
            onTimerReady: (timer) => this.onTimerReady(timer),
            // onPlay : () => this.onPlay(),
            // onPause: () => this.onPause(),
            // onStop : () => this.onStop(),
            // onMediaSeek : (pos) => this.onMediaSeek(pos),
            onTimeUpdate: (pos) => this.onTimeUpdate(pos),
            // onThrottledTimeUpdate: (pos) => this.onThrottledTimeUpdate(pos),
            // onAppParameterUpdate: (name, value) => this.onAppParameterUpdate(name, value),
            // onAppMediaChange: (url) => this.onAppMediaChange(url),
        });
        // this._isReady = true; // ここで true にするとダメ
    }

    public isInitialized(): boolean {
        return this._isReady;
    }

    public isFinished(): boolean {
        if (!this.isInitialized()) {
            return false;
        }

        // position は Player.data.song.length を超える値にならない場合がある為、 length-1 して判定
        return this._player.data.song.length - 1 < this.position / 1000 && !this._player.isPlaying;
    }

    public get position(): number {
        return this._position;
    }

    public get timerPosition(): number {
        return (this._isReady) ? this._player.timer.position : 0;
    }

    public get isPlaying(): boolean {
        return this._player && this._player.isPlaying;
    }

    public get musicInfo(): MusicInfo {
        return this._musicInfo;
    }

    public requestPlay(): boolean {
        if (this._video == null) {
            return false;
        }

        return this._player.requestPlay();
    }

    public requestPause(): boolean {
        if (this._video == null) {
            return false;
        }

        return this._player.requestPause();
    }

    public requestStop(): boolean {
        if (this._video == null) {
            return false;
        }

        return this._player.requestStop();
    }

    public setVolume(vol: number): boolean {
        if (this._video == null) {
            return false;
        }

        this._player.volume = vol;
        return true;
    }

    private onAppReady(app: IPlayerApp): void {
        if (DefDevelop.Debug.ENABLE_DEBUG) {
            console.log(`app:`, app);
        }

        if (!app.songUrl) {
            const forceUsingMV = DefDevelop.Debug.USING_YOUTUBE_MEDIA; // song URL にMV(youtube)を使用するか? piapro使用すると play/pause 操作をアプリ実装する必要ある為
            if (forceUsingMV && this._musicInfo.musicVideoUrl) {
                this._player.createFromSongUrl(this._musicInfo.musicVideoUrl);
            } else {
                this._player.createFromSongUrl(this._musicInfo.songUrl, this._musicInfo.playerVideoOptions);
            }
        }
        // this._isReady = true; // ここで true にするとダメ
    }

    private onVideoReady(v: IVideo): void {
        if (DefDevelop.Debug.ENABLE_DEBUG) {
            console.log(`video:`, v);
        }
        this._video = v;
        // this._isReady = true; // ここで true にするとダメ
    }

    private onTimerReady(timer: Timer): void {
        if (DefDevelop.Debug.ENABLE_DEBUG) {
            console.log(`timer:`, timer);
        }
        this._isReady = true; // ここで true だと不具合発生しない
    }

    private onTimeUpdate(position: number): void {
        if (this._player.isPlaying) {
            // piaproのURLで Player.createFromSongUrl() を実行すると再生せずとも position が増加して意図しない値が入るため、その値は反映させない
            if (this._position == 0 && this._video.firstPhrase.startTime < position) {
                return;
            }
            this._position = position;
        }
    }
}


export class TextAlivePlayerArray extends Array<TextAlivePlayer> {
    public restart(): void {
        this.requestStopAll();
    }

    public requestPlayAll(): boolean {
        var ret = true;
        this.forEach((player: TextAlivePlayer) => {
            ret &&= player.requestPlay();
        });
        return ret;
    }

    public requestPauseAll(): boolean {
        var ret = true;
        this.forEach((player: TextAlivePlayer) => {
            ret &&= player.requestPause();
        });
        return ret;
    }

    public requestStopAll(): boolean {
        var ret = true;
        this.forEach((player: TextAlivePlayer) => {
            ret &&= player.requestStop();
        });
        return ret;
    }
}
