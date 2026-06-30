---
title: "6 Degrees of Automation"
date: 2017-03-31
summary: "A framework for thinking about levels of enterprise automation."
image: "/media/linkedin/6-degrees-of-automation/cover.jpg"
type: post
tags: ["ai", "automation"]
---

![6 Degrees of Automation](/media/linkedin/6-degrees-of-automation/cover.jpg)

![Image](/media/linkedin/6-degrees-of-automation/inline-01.jpg)

These days, nearly every enterprise software company is slapping the RPA (robotic process automation) label onto their products. We thought it’d be helpful to break down the levels of automation for you in simple terms.

## Level 0: 100% manual

Duh.

## Level 1: Attended RPA

Attended RPA introduces the most basic variety of robotics to your operation. On this level, "assistant" bots – essentially packaged, ready to use software programs that execute a defined task - are deployed onto regular occupied workstations (aka desktops). Bots monitor applications waiting for “trigger events” to occur, which tells a bot to do something in the application. Once a trigger event is detected, a bot executes tasks, helping to save time with repeatable activities like copy-pasting data in multiple applications. A person still watches the bot work, checks results, and takes control after the bot is done. If anything goes wrong, a person just does the work manually the way they’ve always done it. Because of the simplicity of this format and the control required by each person managing each bot, there is very limited need for centralized management. This is basically a modern version of Clippy, that Microsoft assistant that everyone loved to hate and hated to love, and level 1 RPA is most often used in contact center scenarios.

![Image](/media/linkedin/6-degrees-of-automation/inline-02.jpg)

Critical capabilities: basic RPA, desktop analytics.

Savings: small to moderate.

## Level 2: RPA with no exception handling

This level eliminates the need for a person to watch the bot run. Bots run on unmonitored desktops, handling chunks of the overall process. Transactions that need to be processed by the bot are prepared as a batch (for example, Excel file with order numbers) and are sent for processing or executed on schedule. Exceptions that occur in bot processing are handled manually outside of the automation by people. Parts of the workflow that cannot be automated using RPA are done fully manually, and hand-offs of work between the bot and the person are done via files or emails. This level is often called "batch automation."

![Image](/media/linkedin/6-degrees-of-automation/inline-03.jpg)

Since bots run on unmonitored desktops, someone usually oversees the automation via its control tower, which consolidates the activities of multiple bots.

Most of RPA tools on the market today tap out at this level.

Critical capabilities: RPA, scheduled execution, control tower.

Savings: moderate.

## Level 3: Unattended RPA

On this level, automation combines bots and people into one workflow. If a bot cannot handle the transaction or if output needs to be reviewed (in a bot maker/human checker paradigm), then a manual step can be performed without interrupting the transaction.

![Image](/media/linkedin/6-degrees-of-automation/inline-04.jpg)

Automations typically run on a completely virtualized infrastructure with non-persistent desktops. Manual work turns into recurring exceptions that can be handled right in the system. At this level, it becomes possible to automate a process end-to-end without creating new hand-offs or the need for additional integrations.

Only leading RPA platforms are able to automate at this level.

Additional critical capabilities: BPM, manual work queue.

Savings: moderate to high.

## Level 4: Smart Automation

This level of automation introduces subjective tasks (for processing unstructured data or making reconciliations in structured data, for example) and quality control functions start to be automated. Automating at this level involves Machine Learning-based analysis of inputs/outputs, task and worker analytics, as well as Six Sigma-based sampling of work results.

![Image](/media/linkedin/6-degrees-of-automation/inline-05.jpg)

Only Intelligent Automation platforms that include Cognitive capabilities are able to automate at this level.

Critical capabilities: worker analytics, cognitive automation, statistical quality control (Six Sigma).

Savings: high

## Level 5: Full automation

Critical capabilities: ML model portability, RPA self-healing, work analytics, worker fitness.

Savings: high

![Image](/media/linkedin/6-degrees-of-automation/inline-06.jpg)

This post was inspired by [autonomous car talk](https://twitter.com/CostaSamaras/status/832637955629998080) by Costa Samaras.

Originally published on [LinkedIn](https://www.linkedin.com/pulse/6-degrees-automation-alex-lyashok).

