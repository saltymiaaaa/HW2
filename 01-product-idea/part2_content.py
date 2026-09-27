# The expanded Part 2. Kept as data so the same text produces the Word document
# and the Markdown copy without either drifting from the other.
#
# ("h", text) is a bold subheading. ("p", text) is a justified body paragraph.

TITLE = "Part 2. Product Idea"

BLOCKS = [
    ("p",
     "The three products in this study all protect a user from a decision made somewhere else, and "
     "my own idea follows the same line. Exit Check is a small service that keeps a working copy of "
     "your data outside the platforms you depend on, opens that copy to confirm it is readable "
     "rather than merely downloaded, and tells you in one sentence what leaving each platform would "
     "cost. I built a working prototype of it before writing this section, which is why the sections "
     "below are able to separate the parts of the idea I was able to test from the parts I was not, "
     "and to report the two places where building it changed my answer."),

    ("h", "The problem"),

    ("p",
     "The cost of leaving a service stays unknown until the moment you need to leave, which is also "
     "the moment you have the least time to deal with it. This is not the same problem as backup. "
     "Most people already hold a copy of something. What they do not hold is an answer, because a "
     "folder of downloaded archives says nothing about whether the files open, whether anything is "
     "missing from them, or how many days of work sit between that folder and being operational "
     "somewhere else."),

    ("p",
     "Three things go wrong quietly, and they are worth separating because they fail in different "
     "ways. Exports run once and then never again, so the copy ages until it describes a version of "
     "your work that no longer exists. Exports download and are never opened, and a truncated "
     "archive is indistinguishable from a complete one until the day somebody tries to use it. And "
     "exports leave things out by design, because comments, version history, permissions and the "
     "relationships between records are usually in no export format at all. None of the three is "
     "visible until the price changes, the free tier shrinks, the company is acquired, or the "
     "feature you organised your work around is withdrawn."),

    ("h", "Why this problem cannot be taken away"),

    ("p",
     "The conclusion of Part 1 was that the main risk to Harbor and Launchie is not a competitor but "
     "a reversal by the company that caused the problem, and that Termphin is the exception because "
     "a mobile connection will not be made reliable by any company decision. That test is the reason "
     "I chose this problem rather than a more obvious one. No vendor has an incentive to publish "
     "what leaving them costs, so no vendor is going to solve it and remove the product. The problem "
     "is also spread across every platform a person uses rather than sitting inside one of them, "
     "which means there is no single company in a position to withdraw it even if one wanted to. It "
     "is Termphin shaped rather than Launchie shaped, and that was the property I was looking for."),

    ("h", "What the product does"),

    ("p",
     "Four steps, and the third one is the product. First, it runs the platform's own published "
     "export on a schedule, daily, weekly or monthly, so the copy does not depend on anyone "
     "remembering. No new way out is invented, because inventing one would put the product in the "
     "position of arguing with the vendor about what the data is. Second, it writes the result to "
     "storage the user already controls, which matters because a service that held the only copy "
     "would be replacing one dependency with another, and that is not an exit. Third, it opens the "
     "archive and parses what is inside it, then compares the copy against the platform one item "
     "type at a time. Fourth, it reports the result as a single sentence: how many hours, how much "
     "money, and exactly what would be left behind."),

    ("p",
     "Most tools in this area stop after the second step. The third is where the value is, because "
     "it converts a folder of archives into an answer, and it is the only step that can tell you "
     "something you did not already assume."),

    ("h", "How the cost of leaving is measured"),

    ("p",
     "Each platform receives a score from 0 to 100. It is produced by six weighted factors, and "
     "every one of them is read from a field the user can inspect. What the export leaves behind "
     "carries the most weight at 0.32, followed by the cost of being operational somewhere else at "
     "0.20. Whether another program can open the exported files and how fast the subscription price "
     "has moved carry 0.14 each. The work required to obtain the export at all, and what the "
     "platform does with your data after you stop paying, carry 0.10 each. Below 30 the service is "
     "portable, below 55 it is sticky, and above that it is trapped."),

    ("p",
     "No model is involved anywhere in the product, and that is a decision rather than a limitation. "
     "Part 1 noted that all three products ranked in the top ten of a week dominated by agent "
     "products, and that none of them uses a model, because what they sell is control and "
     "reliability and a model supplies neither. The same logic applies more sharply here. The whole "
     "claim of this product is that a number can be trusted, so the number has to be one the user "
     "can take apart. In the prototype every factor is displayed next to the sentence it was derived "
     "from, which means a user who disagrees with a score can point at the line that produced it. "
     "This is the detail I said I would borrow from Harbor, which states its pricing rule as a "
     "number inside the product rather than as an intention. A commitment written as a number can be "
     "checked later."),

    ("h", "What I built, and what it can already do"),

    ("p",
     "The prototype is one application that deploys as a single unit with no database, no background "
     "worker and no keys to configure. The portfolio in it is demo data covering six platforms whose "
     "export behaviour is publicly documented, and the connectors that would perform the transfer "
     "are simulated. Two things in it are not simulated: the scoring, and the archive checker."),

    ("p",
     "The checker is the part worth showing first. An export archive can be dropped into it, and it "
     "is opened inside the browser rather than uploaded, so only the list of file names, sizes and "
     "parse results reaches the server. That choice began as an argument about principle, since a "
     "product that asks people to prove they can leave a platform should not begin by uploading "
     "everything they own to a new one, and it turned out to also solve the request size limit of "
     "the hosting it runs on. Inside the archive, every JSON, CSV, XML and note export file is "
     "parsed rather than counted, images are compared against their real first bytes, and the report "
     "names zero byte files, archives nested inside the archive, duplicated paths, file paths too "
     "long to restore, and metadata stranded in sidecar files that most importers ignore."),

    ("p",
     "Run against a sample archive built from faults observed in genuine exports, it reports four "
     "files that are listed and do not parse, a photograph whose contents are an error page the "
     "export server returned, a signed contract that is zero bytes, and dates that are present in "
     "the archive and will be lost anyway because nothing reads them. That is the difference between "
     "a download and a backup, stated in a form somebody can act on."),

    ("h", "Two things building it changed"),

    ("p",
     "The first version of the scoring put all six platforms between 34 and 64, which is a model "
     "that discriminates nothing and would have read as authoritative anyway. Two corrections fixed "
     "it, and both are more honest than what they replaced. A partial export was being counted as "
     "half, but ninety days retained out of six years and a formula that arrives as a static value "
     "are not the same kind of partial, so item types now carry a measured share of what actually "
     "survives. And a weighted average was hiding the single thing that mattered most, so one rule "
     "now overrides the arithmetic: if more than a quarter of what you hold cannot be exported at "
     "all, the service counts as trapped whatever the score says."),

    ("p",
     "That second rule is the one I would not have found by reasoning about the idea. Slack on the "
     "free plan scores 53, which places it below the threshold, because the factors reward it for "
     "being quick to leave. It is quick to leave precisely because almost nothing can be retrieved, "
     "and 94 percent of six years of messages is already unreachable before anybody asks to cancel. "
     "A score that called that situation moderate would have been wrong in the one case the product "
     "exists to catch."),

    ("h", "Who it is for, and what it would cost"),

    ("p",
     "Individuals and small teams holding years of work inside subscription tools, which is the same "
     "group Harbor is aimed at and defined the same way Part 1 observed those products defining "
     "their users: by something they stand to lose rather than by a task they want to finish. The "
     "price would be six dollars a month, fixed for three years and then limited to ten percent a "
     "year, written into the product as a number for the same reason Harbor writes its own. "
     "Cancelling would change nothing about the copies, because they are already on storage the user "
     "owns and were never held by this service in the first place. A product about the cost of "
     "leaving that is expensive to leave would not deserve to be believed."),

    ("h", "What it deliberately is not"),

    ("p",
     "It is not a migration tool, because moving data is a different product with a different "
     "failure mode, and mixing the two would mean the measurement has an interest in the answer. It "
     "is not another place your data lives. It is not a dashboard to be visited, since the correct "
     "behaviour is silence until a number moves and then one sentence. And it is not an AI product, "
     "which in the week these three launched is worth stating plainly rather than apologising for."),

    ("h", "Where the idea is weak"),

    ("p",
     "The engineering that remains is ordinary: one connector per platform, a queue for transfers "
     "too large to run inside a single request, and somewhere durable to keep state. The scoring "
     "also depends on comparing what you hold against what came out, and on several platforms the "
     "count of what you hold is only available on a paid tier, which would push a cost onto the "
     "product for every service it watches. The re-entry hours are currently estimates rather than "
     "measurements, and they carry a fifth of the weight."),

    ("p",
     "The real risk is not any of those. It is that this product has the shape of insurance. People "
     "already suspect that leaving would be expensive and would rather not be told the number, which "
     "makes it easy to defer indefinitely. The evidence I have supports the measurement, and it does "
     "not yet support the demand. The strongest version of the answer is that the product is "
     "cheapest to sell on the day a platform announces a price rise, which is also the day it should "
     "send one sentence and nothing else, and that is a claim the prototype cannot test."),

    ("h", "Judgement"),

    ("p",
     "What the evidence supports is that the question is answerable. A copy can be verified rather "
     "than assumed, the shortfall can be named item by item, and the result compresses into one "
     "sentence without becoming vague. What the evidence does not yet support is that anyone will "
     "pay to hear it before the day they need it. That is the same weakness the three products in "
     "Part 1 share and do not mention: each of them is bought by a user who has already been hurt "
     "once. The difference is that Evernote can cap its pricing and Apple can restore Launchpad, "
     "while no company can make the cost of leaving publicly known, because no company has ever "
     "wanted to."),
]
