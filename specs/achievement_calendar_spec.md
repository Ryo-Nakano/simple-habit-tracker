# 要件定義と実装計画書: 達成カレンダー（Achievement Calendar）

## 1. 目的と変更概要
達成カレンダー（旧ヒートマップ）の表示モードを刷新し、ユーザーが「月」および「四半期」単位で達成状況を確認できるようにします。
モバイルUIへの最適化を最優先とし、従来の「Yearly（年次ヒートマップ）」は廃止します。

## 2. 画面仕様 (UI Specs)

### 2.1 表示モード
以下の2つのモードを実装し、**Monthly** をデフォルトとします。

1.  **Monthly View (月次カレンダー)** [Default]
    -   **レイアウト**: 標準的なカレンダーグリッド（7列 x 週数行）。
    -   **表示内容**: 1ヶ月分の日付セル。
    -   **デザイン**:
        -   各セルは正方形に近い形状。
        -   「達成（ログあり）」の日は、ブランドカラー（例: 緑）の背景色または大きなドットを表示。
        -   「未達成」の日は、薄いグレーまたは枠線のみ。
        -   今日の日付は視覚的に強調（枠線や太字等）。
    -   **モバイル対応**: 横幅いっぱいにグリッドを展開し、タップしやすいサイズを確保。

3.  **Quarterly View (四半期カレンダー)**
    -   **レイアウト**: 横方向（Horizontal）に3ヶ月分を並べる。
    -   **表示内容**: 連続する3ヶ月分の日付セル。
    -   **デザイン**:
        -   GitHubのContribution Graphのような小さなドット（セル）を採用し、3ヶ月分が横幅に収まるようにする。
        -   **期間の基準**: 現在の月を起点に3ヶ月（例: 今が2月なら2-4月）。
        -   **ナビゲーション**: 1ヶ月ずつ移動（例: 2-4月 → nav next → 3-5月）。

### 2.2 Navigation UI
カレンダー上部にナビゲーションバーを配置します。

`[ < ] [ 2026年 2月 ] [ > ]  [ View切替 ]`

-   **前へ/次へボタン**:
    -   Monthlyモード時: 前月/翌月へ移動。
    -   Quarterlyモード時: **1ヶ月単位**で前後に移動（例: 2-4月 → 3-5月）。
-   **タイトル**:
    -   Monthly: "2026年 2月"
    -   Quarterly: "2026年 2月 - 4月"
-   **View切替**: "Monthly" / "Quarterly" を切り替えるトグル。

## 3. 技術実装計画 (Technical Implementation)

### 3.1 コンポーネント構成
既存の `Heatmap.tsx` を廃止し、以下の構成で再実装します。

```
src/client/components/
├── AchievementCalendar.tsx      # [NEW] コンテナ。状態管理 (viewMode, currentDate) を担当
└── CalendarViews/
    ├── MonthlyView.tsx          # Css Grid レイアウト (7 columns)
    ├── QuarterlyView.tsx        # [NEW] GitHub Contribution Graph風レイアウト (Horizontal scroll or scaled fit)
    └── CalendarCell.tsx         # 日付セルの共通コンポーネント (Props: date, isAchieved, isToday)
```

### 3.2 状態管理 (State Management)
`AchievementCalendar` コンポーネント内で以下のStateを保持します。

-   `viewMode`: `'monthly' | 'quarterly'` (Default: `'monthly'`)
-   `currentDate`: `Date` (現在表示している期間の基準日)

### 3.3 データ取得とフィルタリング
-   GASから取得済みの全データ（`logs`）は、親コンポーネント（Dashboard）からPropsとして受け取ります。
-   `AchievementCalendar` 内部で、`currentDate` と `viewMode` に基づいて表示すべき日付範囲（開始日・終了日）を計算し、その範囲内のログ有無を判定して各セルに渡します。

### 3.4 使用ライブラリ
-   `date-fns`: 日付計算（`startOfMonth`, `endOfWeek`, `addMonths` 等）に使用。
    -   *Action*: プロジェクトに未導入であれば追加、または既存のDateユーティリティで代用可能か確認（今回は標準Dateで十分なら依存を増やさない）。
-   `react-calendar-heatmap`: **廃止 (Remove)**。

## 4. 検証手順 (Verification Steps)

1.  **初期表示**:
    -   アプリ起動時、今月のカレンダーが表示されること。
    -   今日の達成状況が正しく反映されていること。
2.  **モード切替**:
    -   Quarterlyに切り替えて、今月を含む3ヶ月分が表示されること。
3.  **期間移動**:
    -   Monthlyで「先月」に移動し、過去の達成記録（草）が表示されること。
4.  **Quarterly View確認**:
    -   Quarterlyに切り替えて、現在月を含む3ヶ月分が横に並んでいること。
    -   ドットのサイズが小さく調整され、GitHubのContribution Graphのような見た目になっていること。
    -   「次へ」を押すと、開始月が1ヶ月ずれることを確認。
5.  **インタラクション**:
    -   日付セルをクリックして、特定の日のタスク確認ができること（既存機能との連携）。

---
**補足**: Yearlyモードおよびライブラリ `react-calendar-heatmap` は削除します。
