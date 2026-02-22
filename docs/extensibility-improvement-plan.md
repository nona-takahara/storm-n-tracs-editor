# 拡張性改善リスト（優先度付き）

## 前提
- XML読み込みは、規格違反XMLの互換維持が必須なため `fast-xml-parser` と `any` 依存を即時には解消しない。
- そのため、XMLパース周辺は「低優先度」に分類し、先に設計面の拡張性を改善する。

## 高優先度（すぐ着手）

### 1) App.tsx の状態集中を分割し、`EditorStore` を導入する
**現状課題**
- `App.tsx` に全状態（頂点・エリア・トラック・車両・選択・編集モード）が集中。
- `InfoView` / `EditStage` へ大量のpropsを受け渡す構成（props drilling）になっている。

**改善案**
- `useReducer` もしくは Zustand/Redux Toolkit 等のストアで「編集状態」を集約。
- UIコンポーネントは `selector` ベースで必要データだけ購読する。
- コマンド（例: `addArea`, `mergeVertex`, `assignTrackArea`）をストアに集約し、UIはイベント発火のみ行う。

**効果**
- 新機能追加時の影響範囲が縮小し、画面追加やモード追加がしやすくなる。

---

### 2) 編集ロジックをUI（Pixiコンポーネント）から `domain/usecase` 層へ移動
**現状課題**
- `EditStage.tsx` に座標変換・選択判定・頂点結合・モード分岐などのドメインロジックが集中。
- コンポーネントが巨大化し、モード追加のたびに分岐が増える。

**改善案**
- `src/domain/editor/` を新設し、以下を純関数として分離。
  - `toWorldPosition`
  - `findNearestVertex`
  - `hitTestArea`
  - `appendVertexToArea`
  - `mergeNearbyVertex`
- `EditMode` ごとのハンドラを `strategy` 化する（`EditAreaHandler`, `AddAreaHandler`, `EditTrackHandler`）。

**効果**
- クリック/ドラッグ挙動の追加・変更を局所化できる。
- ユニットテスト可能な範囲が増える。

---

### 3) 不変更新の一貫性を強制し、参照共有バグを防ぐ
**現状課題**
- `uparea` 等で既存配列を直接 `push` してから再セットする箇所があり、意図しない参照共有を起こしうる。

**改善案**
- ドメインオブジェクト更新は必ず新配列生成（`[...old, newItem]`）で行う。
- `AreaPolygon` / `NtracsTrack` 更新をファクトリ関数化して直接new乱立を抑える。

**効果**
- 変更検知の安定化、将来の状態管理ライブラリ置換コスト低減。

---

### 4) 型安全境界（I/O境界）を追加して `any` の拡散を止める
**現状課題**
- `CreateObject` が JSON/XML 由来データを広範囲で `any` として処理し、UI層に近い位置まで型不明データが到達。

**改善案**
- `io/decoder` 層を設け、`unknown -> AppDTO` の最小バリデーションを実施。
- XMLは完全型安全を目指さず、互換優先の「必要最小限フィールドのみ」型ガード化。
- `CreateObject` は「整形済DTOのみ受け取る」関数に責務縮小。

**効果**
- `any` の影響範囲を局所化でき、他機能の保守性を守れる。

## 中優先度（並行改善）

### 5) ファイルI/Oとパースを `ProjectService` に分離
**現状課題**
- `ProjectUtils.ts` が「Tauri invoke」「XML parse」「状態反映」まで一括実施している。

**改善案**
- `services/project-service.ts` を作成し、
  - `loadProject(file): Promise<ProjectData>`
  - `saveProject(data): Promise<void>`
  に集約。
- UIはサービス呼び出し結果をストアに反映するだけにする。

**効果**
- ファイル形式変更や複数保存形式対応が容易になる。

---

### 6) EditModeを列挙値＋遷移表で管理
**現状課題**
- 複数ファイルで `if/else` によるモード分岐が散在。

**改善案**
- `editModeMachine.ts` を作成し、許可遷移と副作用（選択解除など）を一元管理。
- Nav/Info/Pixi では機械のイベントを送るだけにする。

**効果**
- 新モード追加時の変更漏れを防ぎ、仕様の見通しが良くなる。

---

### 7) 命名・責務の整備（小さいが効く）
**現状課題**
- `InfoViewes` のようなディレクトリ命名ゆれ、`EditTrack.tsx` のコンポーネント名が `EditArea` など可読性を落とす箇所がある。

**改善案**
- `InfoViews` へ統一。
- ファイル名・コンポーネント名・default export 名を一致させる。
- `createX`, `updateX`, `removeX` など操作命名規則を導入。

**効果**
- 認知負荷低減。新規参加者のオンボーディングが速くなる。

## 低優先度（今回は後回し）

### 8) XMLパース層の厳密型付け
- 規格違反XMLを許容する必要があるため、完全厳密化は後回し。
- 当面は「壊れたXMLでも落とさない」方針を維持し、デコーダ境界のみ追加する。

### 9) ジオメトリ判定ロジックの差し替え検討
- `AreaPolygon.isInArea` の数学実装改善余地はあるが、機能拡張阻害の主因ではないため優先度は低め。

## 実施順（推奨）
1. EditorStore導入（props削減）
2. EditStageロジックのdomain分離
3. ProjectService分離
4. I/O境界デコーダ導入（XMLは最低限）
5. EditMode state machine化
6. 命名・構造整理
7. 低優先度項目の改善
