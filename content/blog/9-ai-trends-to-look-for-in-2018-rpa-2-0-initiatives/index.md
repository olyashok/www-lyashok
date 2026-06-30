---
title: "9 AI Trends To Look For in 2018 RPA 2.0 Initiatives"
date: 2017-11-07
summary: "AI trends that were likely to matter for RPA 2.0 initiatives."
image: "/media/linkedin/9-ai-trends-to-look-for-in-2018-rpa-2-0-initiatives/cover.jpg"
type: post
tags: ["ai", "automation"]
---

![9 AI Trends To Look For in 2018 RPA 2.0 Initiatives](/media/linkedin/9-ai-trends-to-look-for-in-2018-rpa-2-0-initiatives/cover.jpg)

![Image](/media/linkedin/9-ai-trends-to-look-for-in-2018-rpa-2-0-initiatives/inline-01.jpg)

We all know that Artificial Intelligence is developing at breakneck speed. But what you may not know, is how these AI technology advancements will benefit your Intelligent Automation or RPA 2.0 programs, making them more powerful and manageable.

Here are nine trending solutions for common automation issues that will help your Digital Workforce improve and evolve in 2018.

## Theme: AI in a Dynamic Enterprise

### 1. Continual Learning

Most Machine Learning (ML) models are trained very infrequently (maaaybe hourly). At the same time, they are making decisions on inputs very frequently (seconds or less). This can cause models to make incorrect decisions when they operate in a dynamic, quickly shifting environment. If a model was trained on a set of documents from one market and documents from another market rapidly coming in quickly, this can cause problems.

Look for:

- Online Learning where models are trained in real-time as new data arrives.
- Ensembles combining frequently trained models with infrequently trained (think Long-term/Short-term memory).
- Reinforcement Learning with focus on learning the policies (not the inputs) and updating the policies based on the feedback.

### 2. Robust Decisions

Making important decisions with Machine Learning means being able to deal with noisy or even adversarial inputs. For example, decisions made on inputs that the model has never seen before can be hard to evaluate.

Look for:

- Data Provenance to track and understand where exactly did training inputs come from.
- Confidence Management to develop more nuanced understanding of the ML model output (confidence intervals) and manage and detect unforeseen inputs.

### 3. Explainable Decisions

Decisions that are made in regulated or sensitive industries, such as banking or healthcare, need to be explained to humans in the context of the regulatory or legal framework in which they were made. This means that you need to establish a set of preventive controls to support audits for an automated process.

Look for:

- Interpretation to be able to interactively review model in terms and concepts that SME is familiar with.
- "What-if" Simulation to understand what other inputs could have led to the same decison.
- Record and Replay being able to to trace, repeat and analyze computations that led to the decision.

## Theme: Secure AI

### 4. Secure Enclaves

Securing AI means being able to run models in an isolated (software or even hardware) environment.

Look for:

- Enclaves to run code in a secure environment that protects data, privacy, and decision integrity.
- Secure Modularization to split AI code into parts where smaller, sensitive part can be run in an enclave and larger unprotected part can be run in an untrusted environment

### 5. Adversarial Learning

Adaptive nature of ML systems makes them vulnerable to new types of attacks. Broadly they can be classified into evasion and data poisoning attacks. Evasion attacks target inference stage, where data is crafted that can be correctly processed by the human, but is processed incorrectly by ML model. For example, 2 documents that look the same to a human, but are classified differently by computer. Data poisoning attacks target training stage, where data is injected into training set to cause ML model to behave incorrectly in the future.

Look for Data provenance and Explainable Decision capabilities described above. They can mitigate these risks and can be effectively combined with Human-in-the-loop (HITL) capabilities to create reliable preventive controls in ML-based automation.

### 6. Shared Learning on Confidential Data

When you conduct learning across data that belongs to multiple organizations you can derive much better results. However, when you train models on sensitive data, prohibiting leaks of confidential information can be a challenge. Hence, exploring secure multi-party learning is increasingly becoming a priority for many organizations.

Look for:

- Differential Privacy to mix noise into data to securely obscure sensitive inputs.
- Multi-party Computation (MPC) to allow each party to compute private inputs on joint models without learning of other party's inputs.

## Theme: AI-specific Enterprise Architecture

### 7. Composable AI systems

Modularity is essential to scaling systems. Breaking down complex software into modules helps reduce cost and improve manageability at scale.

Look for:

- Model Composition to be able to assemble smaller models into ensembles where each individual models can be added or removed to improve overall output and manageability.
- Action Composition to combine model outputs into options thereby shifting decision making to higher-levels of concepts. For example, options to decline or accept claim vs. data on specific document fields.

### 8. Cloud-edge systems

Cloud systems are used extensively today to run and manage AI systems. At the same time, most enterprises operate systems in their data centers or on the edge of the cloud. Systems that combine cost benefits of the cloud with control advantages of the edge systems can bring the best of the both worlds together.

Look for Model Composition and Action Composition described above to be able to take advantage of secure, fast learning on the edge with power of centralized cloud systems.

### 6. Domain specific hardware

Many enterprises increasingly adopt hardware architectures that increase performance, reduce cost, or improve security of AI systems.

Look for:

- GPU and FPGA Support to reduce cost and improve scalability in data centers or public/private clouds
- Google Tensor Processing Unit (TPU) Compatibility to accelerate certain compatible AI payloads
- Enclave Support to take advantage of secure computation such as Intel’s SGX and ARM’s TrustZone

Follow me at [@alyashok](https://twitter.com/alyashok)

Also check out [this academic paper](https://www2.eecs.berkeley.edu/Pubs/TechRpts/2017/EECS-2017-159.pdf), which covers these topics in greater, more technical detail.

Originally published on [LinkedIn](https://www.linkedin.com/pulse/9-ai-trends-look-2018-rpa-20-initiatives-alex-lyashok).

