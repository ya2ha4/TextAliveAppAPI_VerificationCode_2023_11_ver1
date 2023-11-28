# 概要
本プログラムは textalive-app-api (ver.0.3.2) において以下の挙動に関する問い合わせのための検証用に作成したものです。</br>
- Player を複数生成し、requestPlay() を実行すると楽曲が再生されないことがある
- Player を複数生成し、同じタイミングで requestPlay() を実行したものの Player.timer.position に差異が発生する

問い合わせ内容の症状は全て本プログラムにおいて</br>
- 再現性あり（毎回必ず発生）

# 問い合わせ内容
## Player を複数生成し、requestPlay() を実行すると楽曲が再生されないことがある
### 症状
new Player() を実行してから onTimerReady() のイベントリスナーが発生するまでに別の Player を生成すると、requestPlay() を実行しても楽曲が再生されません。</br>
この時、すべての Player.requestPlay() は true を返しています。</br>

### 再現方法
TextAlivePlayer.ts の TextAlivePlayer._isReady を true にすると次の Player を生成するようになっていますので、適所にコメントアウトしている this._isReady = true が実行されるようにして下さい。</br>
Player の生成処理は TextAlivePlayer.initialize() にて実行しています。</br>

### 回避方法
症状の説明にもある通り、onTimerReady() が呼び出されるまで Player の生成を実行しないことで複数の Player が問題なく動作するようになっています。</br>

### 要望
任意のタイミングで Player を生成しても症状が発生しないよう対応いただけますでしょうか？</br>
また、再生に失敗する場合は requestPlay() が false を返すよう対応いただけますでしょうか？</br>


## Player を複数生成し、同じタイミングで requestPlay() を実行したものの Player ごとに position の差異が発生する
### 症状
表題の通り複数の Player.requestPlay() を同一タイミングで実行しても position の値にズレが発生しています。</br>
これは、Player.timer.position や onTimeUpdate() で取得可能な position いずれのケースでも発生します。</br>

### 再現方法
index.ts の MainSequence.update() にて各 Player の position をコンソール出力している処理がありますので、コメントアウトを外して出力をご確認下さい。</br>

### 要望
過去に [Gitter Chat](https://gitter.im/textalive-app-api/community?at=615fc3307db1e3753e2b2469) のやり取りにて言及されていた、ユーザ側でロジックの調整できる環境を提供いただくか、現行の Timer クラスにて対応いただけますでしょうか？</br>


# 検証用プログラム
## セットアップ方法
### 前準備
[Node.js](https://nodejs.org/) をインストールして下さい。</br>

### パッケージのインストール
package.json のあるディレクトリ (app) にて下記コマンドを実行し、パッケージをインストールして下さい。</br>
```
npm install
```

### TextAlive App API トークンの設定
トークンを下記のjsonファイルに設定して下さい。（トークンは https://developer.textalive.jp/ から取得して下さい。）</br>
- 開発用：app/src/textalive/dev_textalive_config.json


## サーバの起動
下記コマンドを実行することで、サーバが起動します。</br>
```
npm run build-dev
```

下記の出力が表示されていればOKです。</br>
そのurlにアクセスすることでアプリを確認することができます。</br>
> Server running at `http://localhost:****` (**** はデフォルト 1234 のポート番号)


## プログラムの挙動
1. 起動すると6曲分の Player クラスを生成し、再生準備を行います。</br>
1. 再生準備が完了するとコンソール出力に ready と表示されます。</br>
1. 画面をクリックすると全ての Player を再生し、一定間隔ごとに聞こえる曲が変わるよう音量を変更する処理が実行されます。</br>


## プログラムの構成
ソースコードは app/src 以下にあります。各ソースコードの概要は以下の通りです。</br>

### index.ts
エントリーポイント用。</br>

### ConstantDefine.ts
定数を定義しているファイル。</br>

### textalive/MusicInfo.ts
マジカルミライ2023プログラミングコンテスト対象楽曲の Plyaer.createFromSongUrl() 用パラメータ定義。</br>

### textalive/TextAlivePlayer.ts
Player クラスを保持、イベントハンドラの登録を行っているクラス。</br>


## License
### package
- textalive-app-api</br>
  https://github.com/TextAliveJp/textalive-app-api/blob/master/LICENSE.md</br>
- copy-files-from-to</br>
  Copyright (c) 2017 webextensions.org</br>
  https://github.com/webextensions/copy-files-from-to/blob/master/LICENSE</br>
- del-cli</br>
  Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com)</br>
  https://github.com/sindresorhus/del-cli/blob/main/license</br>
- parcel</br>
  Copyright (c) 2017-present Devon Govett</br>
  https://github.com/parcel-bundler/parcel/blob/v2/LICENSE</br>
- process</br>
  Copyright (c) 2013 Roman Shtylman <shtylman@gmail.com></br>
  https://github.com/defunctzombie/node-process/blob/master/LICENSE</br>
- typescript</br>
  本アプリではApach License 2.0 のライセンスで配布されているパッケージがインストールされます</br>
  Apache License 2.0 http://www.apache.org/licenses/LICENSE-2.0</br>
  https://github.com/microsoft/TypeScript/blob/main/LICENSE.txt</br>
