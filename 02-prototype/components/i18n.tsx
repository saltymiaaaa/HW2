"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type Lang = "en" | "zh" | "vi";

export const LANGS: { id: Lang; label: string }[] = [
  { id: "en", label: "EN" },
  { id: "zh", label: "中文" },
  { id: "vi", label: "VI" },
];

const dict = {
  /* ------------------------------------------------ EN */
  en: {
    nav: {
      overview: "Overview", portfolio: "Portfolio", verify: "Check an export",
      report: "Exit report", how: "How it works",
      tagline: "Know the cost of leaving",
      startLink: "New here? Start with the three steps.",
      notes: { overview: "start here", portfolio: "demo data", verify: "real tool", report: "printable", how: "" },
    },
    intro: {
      eyebrow: "What is Exit Check?",
      what: "Exit Check tells you — before you ever need to — what it would cost to leave any online service: the hours, the money, and exactly which data would be lost.",
      cards: [
        { k: "The problem", v: "Years of your work live inside subscription tools. When a price hikes or a service shuts down, you find out too late that leaving is expensive." },
        { k: "What it does", v: "It keeps a copy of your data outside each platform — on a schedule — opens that copy to prove it works, and scores how hard leaving would be, 0–100." },
        { k: "What you get", v: "One plain sentence per service: “Leaving Notion today would take ~34 h and you would lose databases, comments and history.”" },
      ],
    },
    hero: {
      pill: "Your data. Your exit.",
      h1a: "You don’t own your work until you can ", h1b: "leave with it",
      lede: "Price hikes. Shrinking free tiers. Sudden shutdowns. Know exactly what quitting any platform costs — hours, money, data lost.",
      cta: "See your exit cost", cta2: "Check an export",
      s1: "platforms scored", s2: "exit-cost score", s3: "data uploaded",
    },
    pains: {
      title: "Backups fail quietly",
      sub: "Three predictable ways.",
      items: [
        { t: "Exports run once", d: "Then never again — the copy quietly rots." },
        { t: "Nobody opens it", d: "A broken archive looks fine until you need it." },
        { t: "Data gets left out", d: "Comments, history, permissions. No export has them." },
      ],
    },
    chart: {
      title: "Your stack, scored",
      sub: "Exit cost 0–100. Higher = harder to leave.",
      verdict: "Trapped · Notion 62",
      hours: "~34 h to leave",
      behind: "5 item types lost",
    },
    scale: {
      title: "What the number means",
      portable: "Portable", sticky: "Sticky", trapped: "Trapped",
      p1: "leave today", p2: "leaving costs days", p3: "data held hostage",
    },
    flow: {
      title: "How it works",
      sub: "The third step is the product.",
      steps: [
        { t: "Export on a schedule", d: "The platform’s own export, run automatically." },
        { t: "Store it yourself", d: "Your disk. Exit Check holds no only-copy." },
        { t: "Verify what’s missing", d: "Every file parsed, compared item by item." },
        { t: "One clear answer", d: "Hours, money, exactly what stays behind." },
      ],
    },
    howto: {
      title: "Try it in 3 minutes",
      items: [
        { t: "Browse the portfolio", cta: "Open portfolio" },
        { t: "Run a live check", cta: "Open Notion" },
        { t: "Check a real archive", cta: "Check an export" },
      ],
    },
    faq: {
      title: "Quick answers",
      items: [
        { q: "Is this a backup tool?", a: "No. A backup gives you a copy. Exit Check tells you what that copy is worth." },
        { q: "Is my data uploaded?", a: "No. Archives open in your browser. Only file names and sizes are scored." },
        { q: "Is any of this AI?", a: "No. Pure arithmetic over fields you can inspect." },
        { q: "Who is it for?", a: "People and small teams with years of work inside subscription tools." },
      ],
    },
    closing: {
      h: "Find out what you’re really locked into.",
      sub: "Free. Three minutes. Nothing leaves your browser.",
      cta: "Check an export now", cta2: "See the portfolio",
    },
    bands: { portable: "Portable", sticky: "Sticky", trapped: "Trapped" },
    verdicts: { readable: "Readable", lossy: "Lossy", unreadable: "Unreadable", unknown: "Unknown" },
    portfolio: {
      flag: "Demo data",
      h1: "What it would cost you to leave",
      lede: "Every service below holds something you would have to get back. Exit Check keeps a copy outside each one, checks that the copy is readable, and reports what did not come out.",
      intro: "What you are looking at.",
      introBody: " Six platforms, each with an exit cost from 0 to 100. Green: you could leave this week. Amber: it would cost you real days. Red: something important does not come out at all.",
      st1: "to be running elsewhere",
      st2: "items that would not come with you",
      st3: "paid every month to keep this arrangement",
      unverified: "Never checked",
      unverifiedBody: ". A service with no verified copy is scored on what the vendor documents, not on what was observed.",
      services: "Services",
      openReport: "Open the full report",
      loading: "Reading the portfolio.",
      recent: "Recent activity",
      unchecked: "Unchecked",
      checked: "Checked",
      never: "Never checked",
    },
    verify: {
      h1: "A download is not a backup until something opens it",
      lede: "Drop a real export here. Exit Check reads the archive inside your browser, parses what it can, and reports what would still hurt on the day you leave. The file is not uploaded.",
      introStrong: "This page is not a demo.",
      introBody: " It runs real parsers over a real file. No export to hand? Press “Try it with a sample export”: it builds a deliberately flawed archive in your browser and checks it like it would check yours.",
      drop: "Drop an export archive here",
      dropHint: "A .zip from Google Takeout, Slack, Notion, X or anywhere else. Also .enex, .json, .csv, .xml and single files.",
      choose: "Choose a file",
      trySample: "Try it with a sample export",
      opening: "Opening the file",
      scoring: "Scoring the manifest",
      verdictTitles: {
        readable: "This is a real backup",
        lossy: "This opens, and it is not a complete exit",
        unreadable: "This does not reliably open",
        unknown: "Nothing to judge yet",
      },
      filesRead: "files read from",
      uncompressed: "uncompressed inside the archive",
      openFmt: "in a format another program opens",
      costTime: "What would cost you time",
      nothing: "Nothing worth reporting, which is rarer than it should be.",
      contents: "What is in there",
      th: { format: "Format", files: "Files", size: "Size", opens: "Opens elsewhere", yes: "Yes", no: "No" },
      checking: "What is actually being checked",
      bullets: [
        "Every JSON, NDJSON, CSV, XML and ENEX file is parsed, not counted.",
        "Images are checked against their magic bytes, so a .jpg that is not a JPEG is caught.",
        "Zero byte files are reported, because they pass a file count and hold nothing.",
        "Paths that will not restore on Windows are listed before you need them.",
        "Archives inside the archive are named, since no total above includes them.",
        "Metadata sidecars are flagged, because most importers quietly ignore them.",
      ],
    },
    report: {
      print: "Print or save as PDF",
      h1: "If you had to leave everything tomorrow",
      lede: "One page, covering every platform being watched. Written to be read on the day somebody changes a price.",
      introStrong: "What you are looking at.",
      introBody: " Every platform being watched, worst first, on one page. Print it or save it as a PDF for the day a price changes.",
      st1: "of work to be running elsewhere",
      st2: "of direct spend to replace what you pay for",
      st3: "average exit cost across",
      st3b: "services",
      worstFirst: "is the one to fix first.",
      every: "Every service, worst first",
      th: { service: "Service", exit: "Exit cost", band: "Band", hours: "Hours", last: "Last copy", behind: "Left behind" },
      never: "never",
      nothing: "nothing",
      sentenceH2: "The sentence for each one",
      footnote: "Exit cost is six weighted factors read from the service record: what the export leaves behind, whether another tool can open it, the work required to obtain it, the cost of running elsewhere, how fast the price moves, and what happens after you stop paying. No model produces this number, so it can be checked line by line.",
      loading: "Building the report.",
    },
    how: {
      h1: "Four steps, and the third one is the product",
      lede: "Most backup tools stop after step two. A file that downloaded is not the same as a file that opens, and neither tells you what leaving would cost.",
      steps: [
        { h: "1. Run the platform’s own export, on a schedule", p: "Exit Check does not invent a way out. It uses the export the platform already publishes and runs it every day, week or month, unattended." },
        { h: "2. Write the copy where you control it", p: "A folder on your own disk, your own storage, your own NAS. Exit Check never holds the only copy of anything." },
        { h: "3. Open it, and say what is missing", p: "Every structured file is parsed. Images are checked against their real bytes. Zero-byte files, nested archives and stranded metadata are reported by name, then compared with the platform item by item. Try it on the Check an export page." },
        { h: "4. Answer one question, in one sentence", p: "Leaving this service today would take about N hours and $N, and you would leave behind these things. That sentence is the entire output." },
      ],
      notTitle: "What it deliberately is not",
      nots: [
        { s: "Not a model.", p: " The exit cost is arithmetic over fields you can read." },
        { s: "Not a migration tool.", p: " Moving your data is a different product. This one only measures." },
        { s: "Not another home for your data.", p: " The copy goes to storage you own. Exports checked here are read in your browser, never uploaded." },
        { s: "Not a dashboard to visit.", p: " Silent until a number moves, then it sends one sentence." },
      ],
      realTitle: "What is real in this prototype, and what is not",
      th: { part: "Part", state: "State", where: "Where it lives" },
      rows: [
        { part: "Export archive inspection", state: "Real" },
        { part: "Exit cost scoring", state: "Real" },
        { part: "Scheduled runs", state: "Real" },
        { part: "Platform connectors and transfer", state: "Simulated" },
        { part: "Portfolio contents", state: "Demo data" },
        { part: "Storage of state", state: "In memory" },
      ],
    },
    service: {
      back: "Back to the portfolio",
      loading: "Loading.",
      notFound: "No such service.",
      introStrong: "What you are looking at.",
      introBody: " One platform in full. The sentence below is the product’s entire output: the six factors behind the score, then every item type you hold and whether it survives the export.",
      checkNow: "Check this service now",
      checking: "Checking…",
      auto: "Check automatically",
      schedule: { daily: "Every day", weekly: "Every week", monthly: "Every month", off: "Never" },
      lastChecked: "Last checked",
      never: "Never checked",
      bandReasonA: "Scored",
      bandReasonB: ", and still counted as trapped.",
      why: "Why the score is what it is",
      whySub: "Six weighted factors, each read from a field you can check. No model is involved.",
      weight: "weight",
      keep: "What you keep here",
      kv: { items: "Items held", stranded: "Would not follow", export: "Export", copy: "Copy written to", after: "After cancellation" },
      costOverTime: "What this has cost over time",
      costSub: "A price that moves is the most common reason people find out too late that leaving is expensive.",
      itemByItem: "Item by item",
      itemSub: "The platform is asked how much of each thing you hold. The copy is asked the same question. This table is the difference.",
      th: { type: "Item type", hold: "You hold", copy: "In the copy", what: "What happens" },
      coverage: { full: "Comes out in full", partial: "Comes out reduced", none: "Stays behind" },
      copies: "Every copy taken so far",
      copiesEmpty: "No copy has been taken yet. Run a check to create the first one.",
      th2: { taken: "Taken", verdict: "Verdict", size: "Size", files: "Files", exit: "Exit cost", seen: "What was observed" },
    },
  },

  /* ------------------------------------------------ ZH */
  zh: {
    nav: {
      overview: "总览", portfolio: "服务清单", verify: "检查导出",
      report: "退出报告", how: "工作原理",
      tagline: "了解离开的成本",
      startLink: "第一次来？从三个步骤开始。",
      notes: { overview: "从这里开始", portfolio: "演示数据", verify: "真实工具", report: "可打印", how: "" },
    },
    intro: {
      eyebrow: "Exit Check 是什么？",
      what: "Exit Check 提前告诉你：离开任何一个在线服务要付出什么代价——多少小时、多少钱、哪些数据会丢。",
      cards: [
        { k: "问题", v: "你多年的工作成果都存在订阅工具里。等到涨价或关停那天才发现，走不起。" },
        { k: "它做什么", v: "按计划把你的数据副本存在平台之外，打开副本验证可用，并给“离开难度”打分（0–100）。" },
        { k: "你得到什么", v: "每个服务一句话：“今天离开 Notion 约需 34 小时，且会丢掉数据库、评论和历史。”" },
      ],
    },
    hero: {
      pill: "你的数据，你的退出。",
      h1a: "带不走的作品，", h1b: "不算真正属于你",
      lede: "涨价、免费额度缩水、突然关停——离开任何平台的代价：时间、金钱、丢失的数据，一目了然。",
      cta: "查看退出成本", cta2: "检查导出文件",
      s1: "个平台已评分", s2: "退出成本分", s3: "数据被上传",
    },
    pains: {
      title: "备份总在悄悄失效",
      sub: "三种常见方式。",
      items: [
        { t: "只导出过一次", d: "之后再没导过——副本悄悄过期。" },
        { t: "没人打开检查", d: "坏档案看起来完好，直到你需要它。" },
        { t: "数据被留下", d: "评论、历史、权限——导出文件里都没有。" },
      ],
    },
    chart: {
      title: "你的工具栈评分",
      sub: "退出成本 0–100，越高越难离开。",
      verdict: "被困 · Notion 62",
      hours: "离开约需 34 小时",
      behind: "丢失 5 类数据",
    },
    scale: {
      title: "数字的含义",
      portable: "可迁移", sticky: "有粘性", trapped: "被困",
      p1: "随时可走", p2: "离开要花数天", p3: "数据被扣为人质",
    },
    flow: {
      title: "工作原理",
      sub: "第三步才是产品核心。",
      steps: [
        { t: "定时自动导出", d: "用平台自带的导出，自动运行。" },
        { t: "自己保存副本", d: "存在你的磁盘，Exit Check 不持有唯一副本。" },
        { t: "校验缺失内容", d: "逐个文件解析，逐项比对。" },
        { t: "给出明确答案", d: "时间、金钱、留下什么，一目了然。" },
      ],
    },
    howto: {
      title: "3 分钟上手",
      items: [
        { t: "浏览服务清单", cta: "打开清单" },
        { t: "运行实时检查", cta: "打开 Notion" },
        { t: "检查真实导出", cta: "检查导出" },
      ],
    },
    faq: {
      title: "常见问题",
      items: [
        { q: "这是备份工具吗？", a: "不是。备份只给副本；Exit Check 告诉你这份副本值多少。" },
        { q: "数据会上传吗？", a: "不会。导出文件在浏览器内打开，只发送文件名和大小用于评分。" },
        { q: "用了 AI 吗？", a: "没有。纯算术，每个字段都可查看。" },
        { q: "给谁用的？", a: "把多年工作放在订阅工具里的个人和小团队。" },
      ],
    },
    closing: {
      h: "看清你到底被什么锁住了。",
      sub: "免费，三分钟，数据不离开浏览器。",
      cta: "立即检查导出", cta2: "查看清单",
    },
    bands: { portable: "可迁移", sticky: "有粘性", trapped: "被困" },
    verdicts: { readable: "可读", lossy: "有损", unreadable: "无法读取", unknown: "未知" },
    portfolio: {
      flag: "演示数据",
      h1: "离开，要付出什么代价",
      lede: "下面每个服务都存着你要拿回来的东西。Exit Check 在平台之外保存副本，验证副本可读，并报告哪些数据没导出来。",
      intro: "你在看什么。",
      introBody: " 六个平台，各有一个 0–100 的退出成本分。绿色：本周就能走。黄色：要花掉好几天。红色：有些重要数据根本出不来。",
      st1: "才能在别处跑起来",
      st2: "项数据带不走",
      st3: "每月为现状支付",
      unverified: "从未检查",
      unverifiedBody: "。没有验证副本的服务按厂商文档评分，而非实测。",
      services: "服务",
      openReport: "查看完整报告",
      loading: "正在读取清单。",
      recent: "最近动态",
      unchecked: "未检查",
      checked: "检查于",
      never: "从未检查",
    },
    verify: {
      h1: "下载下来的，不等于备份——得能打开才算",
      lede: "把真实导出文件拖到这里。Exit Check 在浏览器内读取、解析，并告诉你离开那天哪些数据还是会疼。文件不会被上传。",
      introStrong: "这一页不是演示。",
      introBody: " 它用真实的解析器处理真实文件。手头没有导出？点“用示例导出试试”：它会在浏览器里生成一个故意有缺陷的压缩包，然后像检查你的文件一样检查它。",
      drop: "把导出压缩包拖到这里",
      dropHint: "支持 Google Takeout、Slack、Notion、X 等的 .zip，也支持 .enex、.json、.csv、.xml 和单个文件。",
      choose: "选择文件",
      trySample: "用示例导出试试",
      opening: "正在打开文件",
      scoring: "正在评分",
      verdictTitles: {
        readable: "这是一份真正的备份",
        lossy: "能打开，但不算完整退出",
        unreadable: "无法可靠打开",
        unknown: "还没有可判断的内容",
      },
      filesRead: "个文件，来自",
      uncompressed: "压缩包内未压缩大小",
      openFmt: "是其他程序能打开的格式",
      costTime: "什么会浪费你的时间",
      nothing: "没有值得报告的问题——这比想象中少见。",
      contents: "里面有什么",
      th: { format: "格式", files: "文件数", size: "大小", opens: "别处能打开", yes: "能", no: "不能" },
      checking: "实际检查了什么",
      bullets: [
        "每个 JSON、NDJSON、CSV、XML、ENEX 文件都会被解析，而不只是计数。",
        "图片按魔数校验，假 .jpg 无所遁形。",
        "零字节文件会被报告——它们能凑数，却不包含任何内容。",
        "无法在 Windows 还原的路径会提前列出。",
        "压缩包里的压缩包会被点名，因为上面的统计不包含它们。",
        "元数据附属文件会被标记，因为多数导入工具会悄悄忽略它们。",
      ],
    },
    report: {
      print: "打印或存为 PDF",
      h1: "如果明天必须全部离开",
      lede: "一页纸，覆盖所有被监控的平台。为涨价那天准备好了。",
      introStrong: "你在看什么。",
      introBody: " 所有被监控的平台，最差的排最前。打印或存成 PDF，在价格变化那天拿出来用。",
      st1: "的工作量才能在别处跑起来",
      st2: "的直接花费，用于替换你付费的东西",
      st3: "平均退出成本（共",
      st3b: "个服务）",
      worstFirst: "是第一个该解决的。",
      every: "全部服务，最差优先",
      th: { service: "服务", exit: "退出成本", band: "档位", hours: "小时", last: "上次副本", behind: "被留下" },
      never: "从未",
      nothing: "无",
      sentenceH2: "每个服务的一句话",
      footnote: "退出成本由六个加权因子算出：导出漏掉了什么、别的工具能否打开、取得副本的工作量、在别处跑起来的成本、价格变动速度、停止付费后会怎样。没有模型参与，每一行都可复核。",
      loading: "正在生成报告。",
    },
    how: {
      h1: "四个步骤，第三步才是产品",
      lede: "多数备份工具到第二步就停了。下载下来的文件不等于能打开的文件，两者都不会告诉你离开的成本。",
      steps: [
        { h: "1. 按计划运行平台自带的导出", p: "Exit Check 不发明新的出口，只把平台已有的导出按天/周/月自动运行。" },
        { h: "2. 把副本写到你掌控的地方", p: "你自己的磁盘、对象存储或 NAS。Exit Check 从不持有任何数据的唯一副本。" },
        { h: "3. 打开它，说出缺了什么", p: "每个结构化文件都会被解析，图片按真实字节校验。零字节文件、嵌套压缩包、被遗弃的元数据都会被点名，再与平台逐项比对。可在“检查导出”页立即体验。" },
        { h: "4. 用一句话回答一个问题", p: "“今天离开这个服务约需 N 小时和 $N，还会留下这些东西。”这句话就是全部产出。" },
      ],
      notTitle: "它刻意不做什么",
      nots: [
        { s: "不是模型。", p: " 退出成本是你读得到的字段算出来的。" },
        { s: "不是迁移工具。", p: " 搬数据是另一种产品，这里只负责度量。" },
        { s: "不是数据的又一个家。", p: " 副本存在你自己的存储里；本站检查的导出在浏览器内读取，从不上传。" },
        { s: "不是要天天看的仪表盘。", p: " 数字不动就安静，一动就发来一句话。" },
      ],
      realTitle: "原型里什么是真的",
      th: { part: "部分", state: "状态", where: "代码位置" },
      rows: [
        { part: "导出压缩包检查", state: "真实" },
        { part: "退出成本评分", state: "真实" },
        { part: "定时运行", state: "真实" },
        { part: "平台连接器与搬迁", state: "模拟" },
        { part: "清单内容", state: "演示数据" },
        { part: "状态存储", state: "内存" },
      ],
    },
    service: {
      back: "返回服务清单",
      loading: "加载中。",
      notFound: "没有这个服务。",
      introStrong: "你在看什么。",
      introBody: " 单个平台的完整视图。下面那句话就是产品的全部产出：得分背后的六个因子，以及你持有的每类数据能否在导出后幸存。",
      checkNow: "立即检查此服务",
      checking: "检查中…",
      auto: "自动检查",
      schedule: { daily: "每天", weekly: "每周", monthly: "每月", off: "从不" },
      lastChecked: "上次检查",
      never: "从未检查",
      bandReasonA: "得分",
      bandReasonB: "，仍判定为被困。",
      why: "为什么是这个分数",
      whySub: "六个加权因子，每个都来自你可以核对的字段，没有模型参与。",
      weight: "权重",
      keep: "你在这里存着什么",
      kv: { items: "持有条目", stranded: "带不走的", export: "导出格式", copy: "副本写入", after: "取消订阅后" },
      costOverTime: "这些年花了多少钱",
      costSub: "价格上涨是人们最晚发现“离开很贵”的原因。",
      itemByItem: "逐类对照",
      itemSub: "先问平台你有多少东西，再问副本同样的问题。这张表就是两者的差距。",
      th: { type: "数据类型", hold: "你持有", copy: "副本中", what: "结果" },
      coverage: { full: "完整导出", partial: "导出后缩水", none: "留在平台" },
      copies: "迄今所有的副本",
      copiesEmpty: "还没有副本。运行一次检查即可创建第一份。",
      th2: { taken: "时间", verdict: "结论", size: "大小", files: "文件数", exit: "退出成本", seen: "观察到什么" },
    },
  },

  /* ------------------------------------------------ VI */
  vi: {
    nav: {
      overview: "Tổng quan", portfolio: "Danh sách dịch vụ", verify: "Kiểm tra export",
      report: "Báo cáo thoát", how: "Cách hoạt động",
      tagline: "Biết giá phải trả khi rời đi",
      startLink: "Lần đầu dùng? Bắt đầu với ba bước.",
      notes: { overview: "bắt đầu ở đây", portfolio: "dữ liệu demo", verify: "công cụ thật", report: "in được", how: "" },
    },
    intro: {
      eyebrow: "Exit Check là gì?",
      what: "Exit Check cho bạn biết trước cái giá phải trả khi rời bỏ bất kỳ dịch vụ trực tuyến nào: bao nhiêu giờ, bao nhiêu tiền, và chính xác dữ liệu gì sẽ mất.",
      cards: [
        { k: "Vấn đề", v: "Nhiều năm công việc của bạn nằm gọn trong các dịch vụ thuê bao. Đến khi tăng giá hoặc đóng cửa, bạn mới biết là… đi không nổi." },
        { k: "Nó làm gì", v: "Tự động lưu một bản sao dữ liệu của bạn bên ngoài từng nền tảng, mở thử bản sao đó để chứng minh dùng được, rồi chấm điểm độ khó khi rời đi (0–100)." },
        { k: "Bạn nhận được gì", v: "Mỗi dịch vụ một câu dễ hiểu: “Rời Notion hôm nay mất khoảng 34 giờ, và bạn sẽ mất баз dữ liệu, bình luận cùng lịch sử chỉnh sửa.”" },
      ],
    },
    hero: {
      pill: "Dữ liệu của bạn — quyền rời đi của bạn",
      h1a: "Bạn chỉ thực sự sở hữu dữ liệu khi ", h1b: "mang nó ra được",
      lede: "Tăng giá. Gói miễn phí bị cắt. Dịch vụ đột ngột đóng cửa. Exit Check cho bạn biết chính xác cái giá khi rời bỏ một nền tảng: bao nhiêu giờ, bao nhiêu tiền, mất những dữ liệu gì.",
      cta: "Xem chi phí rời bỏ", cta2: "Kiểm tra file export",
      s1: "dịch vụ đã chấm điểm", s2: "thang điểm khó rời (0–100)", s3: "dữ liệu bị tải lên",
    },
    pains: {
      title: "Sao lưu vẫn thất bại âm thầm",
      sub: "Theo ba cách rất quen thuộc.",
      items: [
        { t: "Chỉ export đúng một lần", d: "Rồi không bao giờ lặp lại — bản sao cũ dần theo thời gian." },
        { t: "Chẳng ai mở ra kiểm tra", d: "File hỏng nhìn ngoài vẫn ổn, đến lúc cần mới phát hiện." },
        { t: "Dữ liệu luôn bị sót", d: "Bình luận, lịch sử chỉnh sửa, phân quyền — không bản export nào chứa." },
      ],
    },
    chart: {
      title: "Điểm khóa của các dịch vụ bạn đang dùng",
      sub: "Thang 0–100, càng cao càng khó rời đi.",
      verdict: "Bị kẹt · Notion 62",
      hours: "~34 giờ để rời đi",
      behind: "mất 5 loại dữ liệu",
    },
    scale: {
      title: "Con số này có ý nghĩa gì",
      portable: "Dễ rời", sticky: "Khó rời", trapped: "Bị kẹt",
      p1: "có thể đi ngay hôm nay", p2: "rời đi tốn vài ngày làm việc", p3: "dữ liệu bị giữ lại, không lấy ra được",
    },
    flow: {
      title: "Cách hoạt động",
      sub: "Bước thứ ba mới là phần chính.",
      steps: [
        { t: "Tự động export theo lịch", d: "Dùng chính tính năng export của nền tảng." },
        { t: "Bản sao do bạn giữ", d: "Lưu trên máy bạn — Exit Check không giữ bản duy nhất." },
        { t: "Kiểm chứng thiếu những gì", d: "Từng file được phân tích, đối chiếu từng mục." },
        { t: "Một câu trả lời rõ ràng", d: "Bao nhiêu giờ, bao nhiêu tiền, cái gì bị bỏ lại." },
      ],
    },
    howto: {
      title: "Dùng thử trong 3 phút",
      items: [
        { t: "Xem danh sách dịch vụ", cta: "Mở danh sách" },
        { t: "Chạy một lần kiểm tra", cta: "Mở Notion" },
        { t: "Kiểm tra file export thật", cta: "Kiểm tra ngay" },
      ],
    },
    faq: {
      title: "Trả lời nhanh",
      items: [
        { q: "Đây có phải công cụ backup?", a: "Không. Backup chỉ tạo bản sao; Exit Check cho bạn biết bản sao đó đáng giá bao nhiêu." },
        { q: "Dữ liệu có bị tải lên không?", a: "Không. File được mở ngay trong trình duyệt, chỉ có tên và dung lượng được gửi đi để chấm điểm." },
        { q: "Có dùng AI không?", a: "Không. Kết quả hoàn toàn là phép tính trên các số liệu bạn tự xem được." },
        { q: "Dành cho ai?", a: "Cá nhân và nhóm nhỏ đang giữ nhiều năm công việc trong các dịch vụ thuê bao." },
      ],
    },
    closing: {
      h: "Khám phá bạn đang bị khóa vào điều gì.",
      sub: "Miễn phí, 3 phút, dữ liệu không hề rời khỏi trình duyệt.",
      cta: "Kiểm tra export ngay", cta2: "Xem danh sách",
    },
    bands: { portable: "Dễ rời", sticky: "Khó rời", trapped: "Bị kẹt" },
    verdicts: { readable: "Đọc được", lossy: "Suy hao", unreadable: "Không đọc được", unknown: "Chưa rõ" },
    portfolio: {
      flag: "Dữ liệu demo",
      h1: "Rời đi thì phải trả giá nào",
      lede: "Mỗi dịch vụ bên dưới đang giữ một phần thứ bạn phải lấy lại được. Exit Check lưu bản sao bên ngoài từng nền tảng, kiểm tra bản sao đó còn đọc được không, và báo cáo những gì không theo bạn ra đi.",
      intro: "Bạn đang xem gì.",
      introBody: " Sáu nền tảng, mỗi cái một điểm thoát từ 0 đến 100. Xanh: có thể rời ngay tuần này. Vàng: tốn mấy ngày thật. Đỏ: có dữ liệu quan trọng không bao giờ ra khỏi nền tảng.",
      st1: "để vận hành lại ở nơi khác",
      st2: "mục dữ liệu không theo bạn được",
      st3: "phải trả mỗi tháng cho hiện trạng",
      unverified: "Chưa từng kiểm tra",
      unverifiedBody: ". Dịch vụ chưa có bản sao đã kiểm chứng sẽ được chấm theo tài liệu của nhà cung cấp, không phải theo thực tế.",
      services: "Dịch vụ",
      openReport: "Xem báo cáo đầy đủ",
      loading: "Đang tải danh sách.",
      recent: "Hoạt động gần đây",
      unchecked: "Chưa kiểm tra",
      checked: "Kiểm tra",
      never: "Chưa từng kiểm tra",
    },
    verify: {
      h1: "Tải về chưa phải là backup — phải mở được mới tính",
      lede: "Kéo file export thật vào đây. Exit Check đọc file ngay trong trình duyệt, phân tích những gì đọc được, và chỉ ra điều gì sẽ khiến bạn đau đầu vào ngày rời đi. File không bị tải lên đâu.",
      introStrong: "Trang này không phải demo.",
      introBody: " Nó chạy bộ phân tích thật trên file thật. Không có file export? Bấm “Thử với file mẫu”: trang sẽ tạo một file zip cố tình có lỗi ngay trong trình duyệt, rồi kiểm tra nó y như kiểm tra file của bạn.",
      drop: "Kéo file export vào đây",
      dropHint: "File .zip từ Google Takeout, Slack, Notion, X… Cũng nhận .enex, .json, .csv, .xml và file đơn.",
      choose: "Chọn file",
      trySample: "Thử với file mẫu",
      opening: "Đang mở file",
      scoring: "Đang chấm điểm",
      verdictTitles: {
        readable: "Đây mới là backup thật",
        lossy: "Mở được, nhưng chưa đủ để rời đi",
        unreadable: "File này không mở được chắc chắn",
        unknown: "Chưa có gì để đánh giá",
      },
      filesRead: "file đọc được từ",
      uncompressed: "dung lượng giải nén bên trong",
      openFmt: "ở định dạng phần mềm khác mở được",
      costTime: "Những gì sẽ khiến bạn tốn thời gian",
      nothing: "Không có gì đáng báo — điều này hiếm hơn bạn nghĩ.",
      contents: "Bên trong có gì",
      th: { format: "Định dạng", files: "Số file", size: "Dung lượng", opens: "Mở được ở chỗ khác", yes: "Có", no: "Không" },
      checking: "Thực tế đang kiểm tra những gì",
      bullets: [
        "Mọi file JSON, NDJSON, CSV, XML, ENEX đều được phân tích, không chỉ đếm số lượng.",
        "Ảnh được kiểm tra theo magic bytes — file .jpg giả sẽ bị phát hiện.",
        "File 0 byte bị liệt kê: chúng lọt qua phép đếm nhưng chẳng chứa gì.",
        "Đường dẫn không khôi phục được trên Windows được liệt kê trước khi bạn cần.",
        "File nén nằm trong file nén bị điểm danh, vì số liệu tổng không bao gồm chúng.",
        "File metadata đi kèm được đánh dấu — phần lớn công cụ nhập khẩu lặng lẽ bỏ qua chúng.",
      ],
    },
    report: {
      print: "In hoặc lưu PDF",
      h1: "Nếu ngày mai phải rời bỏ tất cả",
      lede: "Một trang duy nhất cho mọi nền tảng đang theo dõi — viết ra để đọc đúng vào ngày ai đó đổi giá.",
      introStrong: "Bạn đang xem gì.",
      introBody: " Mọi nền tảng đang theo dõi, cái tệ nhất đứng đầu trang. In ra hoặc lưu PDF để dùng đúng lúc giá thay đổi.",
      st1: "công việc để vận hành lại ở nơi khác",
      st2: "chi phí trực tiếp để thay thế thứ bạn đang trả tiền",
      st3: "điểm thoát trung bình trên",
      st3b: "dịch vụ",
      worstFirst: "là cái cần xử lý đầu tiên.",
      every: "Tất cả dịch vụ, tệ nhất lên đầu",
      th: { service: "Dịch vụ", exit: "Điểm thoát", band: "Mức", hours: "Giờ", last: "Bản sao gần nhất", behind: "Bị bỏ lại" },
      never: "chưa bao giờ",
      nothing: "không có gì",
      sentenceH2: "Mỗi dịch vụ một câu",
      footnote: "Điểm thoát là sáu yếu tố có trọng số đọc từ hồ sơ dịch vụ: export sót gì, công cụ khác có mở được không, tốn bao nhiêu công để lấy, chi phí chạy nơi khác, giá tăng nhanh thế nào, và điều gì xảy ra khi bạn ngừng trả tiền. Không có mô hình AI nào sinh ra con số này nên bạn kiểm tra được từng dòng.",
      loading: "Đang dựng báo cáo.",
    },
    how: {
      h1: "Bốn bước, bước thứ ba là sản phẩm",
      lede: "Đa số công cụ backup dừng ở bước hai. File tải về khác file mở được, và không cái nào cho bạn biết rời đi tốn bao nhiêu.",
      steps: [
        { h: "1. Chạy export của chính nền tảng, theo lịch", p: "Exit Check không phát minh lối ra mới — chỉ dùng đúng tính năng export nền tảng đã có, chạy tự động theo ngày/tuần/tháng." },
        { h: "2. Lưu bản sao vào nơi bạn kiểm soát", p: "Thư mục trên máy bạn, storage của bạn, NAS của bạn. Exit Check không bao giờ giữ bản duy nhất của dữ liệu." },
        { h: "3. Mở nó ra, và nói rõ thiếu gì", p: "Mỗi file có cấu trúc đều được phân tích; ảnh được so với byte thật. File 0 byte, file nén lồng nhau, metadata bị bỏ lại đều bị điểm danh, rồi đối chiếu với nền tảng từng mục một. Thử ngay tại trang Kiểm tra export." },
        { h: "4. Trả lời một câu hỏi, bằng một câu nói", p: "“Rời dịch vụ này hôm nay mất khoảng N giờ và $N, và bạn sẽ để lại những thứ này.” Câu đó là toàn bộ sản phẩm." },
      ],
      notTitle: "Những gì nó cố tình không làm",
      nots: [
        { s: "Không phải mô hình AI.", p: " Điểm thoát là phép tính trên các trường bạn tự đọc được." },
        { s: "Không phải công cụ chuyển dữ liệu.", p: " Chuyển dữ liệu là sản phẩm khác; cái này chỉ đo lường." },
        { s: "Không phải một chỗ nữa để dữ liệu nằm.", p: " Bản sao nằm trong storage của bạn; file kiểm tra tại trang này được đọc trong trình duyệt, không bao giờ tải lên." },
        { s: "Không phải dashboard phải mở hằng ngày.", p: " Im lặng cho tới khi một con số nhảy — khi đó gửi đúng một câu." },
      ],
      realTitle: "Trong bản prototype này, cái gì là thật",
      th: { part: "Phần", state: "Trạng thái", where: "Nằm ở đâu" },
      rows: [
        { part: "Kiểm tra file export", state: "Thật" },
        { part: "Chấm điểm thoát", state: "Thật" },
        { part: "Chạy theo lịch", state: "Thật" },
        { part: "Connector và chuyển dữ liệu", state: "Mô phỏng" },
        { part: "Nội dung danh sách", state: "Dữ liệu demo" },
        { part: "Lưu trạng thái", state: "Trong bộ nhớ" },
      ],
    },
    service: {
      back: "Về danh sách dịch vụ",
      loading: "Đang tải.",
      notFound: "Không có dịch vụ này.",
      introStrong: "Bạn đang xem gì.",
      introBody: " Toàn cảnh một nền tảng. Câu bên dưới là toàn bộ sản phẩm: sáu yếu tố đứng sau điểm số, rồi từng loại dữ liệu bạn đang giữ và nó có sống sót qua lần export hay không.",
      checkNow: "Kiểm tra dịch vụ này ngay",
      checking: "Đang kiểm tra…",
      auto: "Tự động kiểm tra",
      schedule: { daily: "Mỗi ngày", weekly: "Mỗi tuần", monthly: "Mỗi tháng", off: "Tắt" },
      lastChecked: "Kiểm tra gần nhất",
      never: "Chưa từng kiểm tra",
      bandReasonA: "Đạt",
      bandReasonB: " điểm nhưng vẫn bị tính là bị kẹt.",
      why: "Vì sao điểm số như vậy",
      whySub: "Sáu yếu tố có trọng số, mỗi cái đọc từ một trường bạn kiểm tra được. Không có mô hình nào tham gia.",
      weight: "trọng số",
      keep: "Bạn đang giữ gì ở đây",
      kv: { items: "Số mục đang giữ", stranded: "Sẽ không theo bạn", export: "Định dạng export", copy: "Bản sao ghi vào", after: "Sau khi hủy" },
      costOverTime: "Bạn đã trả bao nhiêu cho đến nay",
      costSub: "Giá leo thang là lý do phổ biến nhất khiến người ta phát hiện quá muộn rằng rời đi rất đắt.",
      itemByItem: "Đối chiếu từng loại",
      itemSub: "Hỏi nền tảng bạn đang giữ bao nhiêu, rồi hỏi bản sao cùng câu hỏi. Bảng này là khoảng cách giữa hai câu trả lời.",
      th: { type: "Loại dữ liệu", hold: "Bạn giữ", copy: "Trong bản sao", what: "Kết quả" },
      coverage: { full: "Ra hết", partial: "Ra bị suy giảm", none: "Ở lại nền tảng" },
      copies: "Tất cả bản sao đã tạo",
      copiesEmpty: "Chưa có bản sao nào. Chạy một lần kiểm tra để tạo bản đầu tiên.",
      th2: { taken: "Thời điểm", verdict: "Kết luận", size: "Dung lượng", files: "Số file", exit: "Điểm thoát", seen: "Quan sát thấy" },
    },
  },
} as const;

type Dict = (typeof dict)["en"];

const LangContext = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Dict;
}>({ lang: "en", setLang: () => {}, t: dict.en });

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = window.localStorage.getItem("ec-lang") as Lang | null;
    if (saved && saved in dict) setLangState(saved);
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    window.localStorage.setItem("ec-lang", l);
  }, []);

  return (
    <LangContext.Provider value={{ lang, setLang, t: dict[lang] as Dict }}>
      {children}
    </LangContext.Provider>
  );
}

export function useI18n() {
  return useContext(LangContext);
}

export function LanguageSwitcher() {
  const { lang, setLang } = useI18n();
  return (
    <div className="lang-switch" role="group" aria-label="Language">
      {LANGS.map((l) => (
        <button
          key={l.id}
          className={lang === l.id ? "is-active" : ""}
          onClick={() => setLang(l.id)}
          aria-pressed={lang === l.id}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
