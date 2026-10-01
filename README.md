# 暮らしノート

予定・Todo・家計簿をひとつにまとめ、予定の予算と実際の支出を関連付けて管理できるスマートフォン向けアプリです。

## アプリ概要

- 今日の予定、未完了Todo、月間収支、月間予算をホームで確認
- 月単位のカレンダーで予定を確認・追加
- 予定ごとの予算、実際の支出、差額を表示
- 支出を予定に関連付け、予定詳細から関連支出を確認
- 支出・収入の月別履歴と編集・削除
- カテゴリ別支出と過去6か月の支出推移を確認
- SQLiteに保存するため、アプリ再起動後もデータを保持

## 使用技術

- React Native
- Expo SDK 52
- Expo Router
- TypeScript（strict mode）
- expo-sqlite（SQLite / WAL）
- React Native標準コンポーネント

追加のチャートライブラリは使用せず、分析画面のバー表示は標準Viewで描画しています。

PCブラウザで起動した場合はSQLiteの代わりにlocalStorageを使うWeb互換データ層が動作します。スマートフォンのAndroid/iOSではSQLiteに保存します。

## インストール方法

Node.js（LTS）とnpmを用意し、プロジェクト直下で実行します。

```bash
npm install
```

Expo CLIをグローバルにインストールする必要はありません。

## 起動方法

```bash
npm start
```

表示されたQRコードをExpo Goで読み取るか、以下を実行します。

```bash
npm run android
npm run ios
npm run web
```

PCブラウザで確認する場合は `npm run web` を実行し、`http://localhost:8081/` を開きます。

初回起動時に `life-manager.db` が作成され、必要なテーブルが自動作成されます。

## Git公開とスマホアプリ化

このプロジェクトはEAS Buildに対応しています。EASを使うと、クラウド上でAndroid用APK/AAB、iOS用IPAをビルドできます。

### 1. GitHubなどへ公開

```bash
git init
git add .
git commit -m "初回: 暮らしノートMVP"
git branch -M main
git remote add origin https://github.com/<ユーザー名>/<リポジトリ名>.git
git push -u origin main
```

`node_modules`、SQLiteのローカルDB、Expoの生成物は `.gitignore` で除外しています。

### 2. EASにログイン

Expoアカウントを作成してから、プロジェクト直下で実行します。

```bash
npx eas-cli login
npx eas-cli init
```

`eas init` はこのアプリをExpoプロジェクトに紐付け、必要なプロジェクトIDを設定します。

### 3. Androidのテスト用アプリを作成

```bash
npm run build:preview
```

生成されたAPKのURLをAndroidスマートフォンで開いてインストールできます。

### 4. ストア公開用ビルド

```bash
npm run build:android
npm run build:ios
```

AndroidはAAB、iOSはApp Store Connect提出用のビルドになります。提出は以下です。

```bash
npm run submit:android
npm run submit:ios
```

iOSの実機配布やApp Store公開にはApple Developerアカウント、Android公開にはGoogle Play Consoleアカウントが必要です。

## 型チェック

```bash
npm run typecheck
```

## ディレクトリ構成

```text
app/
  (tabs)/          ホーム、カレンダー、追加、家計簿、分析
  event/           予定の登録・編集・詳細
  todo/            Todo一覧・登録・編集
  transaction/     収支の登録・編集
  settings.tsx     月間予算設定
components/
  forms.tsx        予定・Todo・収支の共通入力フォーム
  records.tsx      予定・Todo・取引カード
  ui.tsx           共通UI（カード、入力、ボタン等）
constants/
  theme.ts         色、カテゴリ、支払い方法
database/
  migrations.ts    SQLiteテーブルとインデックスの初期化
lib/
  db.ts            SQLite CRUDと集計クエリ
  date.ts          日付処理
  format.ts        金額・割合の表示処理
types/
  models.ts        アプリデータ型
```

## 実装済み機能

- 予定の新規登録・一覧・詳細・編集・削除
- 予定のカテゴリ、時間、終日、場所、メモ、予算
- カレンダーの月移動、予定ドット、日付別一覧
- Todoの新規登録・一覧・編集・削除・完了切り替え
- Todoの期限、カテゴリ、優先度、メモ
- 支出・収入の新規登録・月別一覧・編集・削除
- 支出カテゴリ、支払い方法、店名、メモ
- 支出と予定の関連付け
- 予定予算と関連支出の合計、差額表示
- 月間予算の保存とホーム画面での使用率表示
- 月間収入・支出・収支の集計
- カテゴリ別支出、過去6か月の支出推移
- 入力チェック、削除確認ダイアログ、読み込みエラー表示

## データベース

以下のテーブルをSQLiteに作成します。

- `events`
- `todos`
- `transactions`
- `settings`

`transactions.eventId` は外部キーで予定と連携し、予定削除時は関連支出を削除せず `NULL` にします。
