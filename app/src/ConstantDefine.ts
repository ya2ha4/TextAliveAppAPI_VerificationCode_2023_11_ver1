export namespace DefDevelop {
    export class Debug {
        static readonly ENABLE_DEBUG = false;

        // デバッグ用：youtube の動画を表示するか
        // 本番環境は false
        // コンテスト用の設定と異なる為、歌詞の再生タイミングや楽曲地図情報が変わるため注意
        static readonly USING_YOUTUBE_MEDIA = false;

    }
    export class Info {
        static readonly MUSIC_NUM = 6;
    }
}
