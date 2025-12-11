// 文章数据模块
// 未来可以替换为数据库读取

const articles = [
  {
    id: "1",
    title: "人工智能的发展历程",
    preview: "人工智能从诞生到现在已经走过了70多年的历程，经历了多次起伏。本文将回顾AI发展的关键节点。",
    content: "人工智能（Artificial Intelligence，简称AI）从诞生到现在已经走过了70多年的历程，经历了多次起伏。本文将回顾AI发展的关键节点。\n\n1950年代，图灵提出了著名的图灵测试，为AI研究奠定了基础。1956年，达特茅斯会议标志着AI学科的正式诞生。\n\n1960-1970年代是AI的第一次繁荣期，专家系统开始出现。但随后遇到了计算能力不足的问题，进入了第一次AI寒冬。\n\n1980年代，专家系统重新兴起，但很快又遇到了知识获取的瓶颈。\n\n2000年代以后，随着计算能力的提升和大数据的出现，机器学习特别是深度学习技术取得了突破性进展。2012年，AlexNet在ImageNet竞赛中的胜利标志着深度学习时代的到来。\n\n如今，ChatGPT等大语言模型的出现，让AI进入了新的发展阶段。",
    createdAt: "2024-01-15T10:30:00.000Z"
  },
  {
    id: "2",
    title: "如何学习编程",
    preview: "编程是一门需要持续练习的技能。本文将介绍学习编程的有效方法和建议。",
    content: "编程是一门需要持续练习的技能。本文将介绍学习编程的有效方法和建议。\n\n首先，选择一门适合初学者的编程语言很重要。Python因其语法简洁、应用广泛，是很多人的首选。JavaScript也是不错的选择，特别是如果你想做Web开发。\n\n其次，理论学习要与实践相结合。光看书是不够的，必须动手写代码。可以从简单的项目开始，比如做一个计算器、待办事项列表等。\n\n第三，要学会阅读和理解别人的代码。GitHub上有大量的开源项目，可以学习优秀的代码风格和设计模式。\n\n最后，保持耐心和持续学习。编程是一个不断学习新技术的领域，不要因为遇到困难就放弃。",
    createdAt: "2024-01-16T14:20:00.000Z"
  },
  {
    id: "3",
    title: "Introduction to Machine Learning",
    preview: "Machine learning is a subset of artificial intelligence. Let's explore the basics of ML and its applications.",
    content: "Machine learning is a subset of artificial intelligence. Let's explore the basics of ML and its applications.\n\nMachine learning (ML) enables computers to learn from data without being explicitly programmed. There are three main types: supervised learning, unsupervised learning, and reinforcement learning.\n\nSupervised learning uses labeled data to train models. Common algorithms include linear regression, decision trees, and neural networks. 监督学习使用标注数据来训练模型。\n\nUnsupervised learning finds patterns in unlabeled data. Clustering and dimensionality reduction are typical examples. 无监督学习在未标注数据中寻找模式。\n\nReinforcement learning involves an agent learning through trial and error in an environment. This is how AlphaGo learned to play Go.\n\nML has applications in many fields: image recognition, natural language processing, recommendation systems, and autonomous vehicles.",
    createdAt: "2024-01-17T09:15:00.000Z"
  },
  {
    id: "4",
    title: "The Future of Web Development",
    preview: "Web development is evolving rapidly. Let's discuss the latest trends and technologies shaping the future of the web.",
    content: "Web development is evolving rapidly. Let's discuss the latest trends and technologies shaping the future of the web.\n\nReact, Vue, and Angular are the three most popular frontend frameworks today. They enable developers to build complex, interactive user interfaces efficiently. 这些框架让开发者能够高效地构建复杂的交互式用户界面。\n\nOn the backend, Node.js has made JavaScript a full-stack language. Serverless architectures are becoming more common, reducing infrastructure management overhead.\n\nWebAssembly (WASM) allows running high-performance code in browsers, opening new possibilities for web applications. WebAssembly 允许在浏览器中运行高性能代码。\n\nProgressive Web Apps (PWAs) combine the best of web and mobile apps, offering offline functionality and native-like experiences.\n\nThe future looks bright for web developers, with new tools and frameworks emerging regularly.",
    createdAt: "2024-01-18T16:45:00.000Z"
  },
  {
    id: "5",
    title: "健康饮食的重要性",
    preview: "合理的饮食习惯对身体健康至关重要。本文将探讨如何通过饮食来保持健康。",
    content: "合理的饮食习惯对身体健康至关重要。本文将探讨如何通过饮食来保持健康。\n\n首先，要保证营养均衡。每天应该摄入足够的蛋白质、碳水化合物、脂肪、维生素和矿物质。多吃新鲜蔬菜和水果，它们富含维生素和纤维。\n\n其次，要控制食量。暴饮暴食会导致肥胖和各种慢性疾病。建议采用少食多餐的方式，每餐吃到七分饱即可。\n\n第三，要选择健康的烹饪方式。蒸、煮、炖比油炸、烧烤更健康。减少盐、糖和油的摄入量。\n\n最后，要保持规律的饮食时间。早餐要吃好，午餐要吃饱，晚餐要吃少。不要因为工作忙碌就忽略正餐。\n\n记住，健康的饮食是健康生活的基础。",
    createdAt: "2024-01-19T11:00:00.000Z"
  },
  {
    id: "6",
    title: "Understanding RESTful API Design",
    preview: "REST is a popular architectural style for designing web APIs. Learn the principles and best practices of RESTful API design.",
    content: "REST is a popular architectural style for designing web APIs. Learn the principles and best practices of RESTful API design.\n\nREST stands for Representational State Transfer. It uses HTTP methods (GET, POST, PUT, DELETE) to perform operations on resources. REST 代表表述性状态传递，使用 HTTP 方法对资源进行操作。\n\nKey principles include:\n1. Stateless: Each request contains all information needed to process it.\n2. Resource-based: URLs represent resources, not actions.\n3. Uniform interface: Standard HTTP methods and status codes.\n\nGood API design follows conventions. Use nouns for resources (e.g., /articles, /users), not verbs. 使用名词表示资源，而不是动词。\n\nStatus codes matter: 200 for success, 201 for created, 404 for not found, 500 for server errors.\n\nVersion your APIs (e.g., /api/v1/articles) to allow evolution without breaking existing clients. 对 API 进行版本控制，以便在不破坏现有客户端的情况下进行演进。",
    createdAt: "2024-01-20T13:30:00.000Z"
  },
  {
    id: "7",
    title: "移动应用开发趋势",
    preview: "移动应用开发领域正在快速发展。本文将介绍当前的主要趋势和技术。",
    content: "移动应用开发领域正在快速发展。本文将介绍当前的主要趋势和技术。\n\n跨平台开发框架越来越受欢迎。React Native、Flutter 和 Xamarin 等工具让开发者可以用一套代码同时支持 iOS 和 Android。这大大提高了开发效率，降低了维护成本。\n\n原生开发虽然性能最优，但需要维护两套代码。对于大多数应用来说，跨平台方案已经足够好。\n\n小程序生态也在快速发展。微信小程序、支付宝小程序等让用户无需下载就能使用应用。\n\n5G 网络的普及为移动应用带来了新的可能性。更快的网速和更低的延迟使得实时视频、AR/VR 等应用成为可能。\n\n未来，移动应用将更加智能化，AI 能力将成为标配。",
    createdAt: "2024-01-21T15:20:00.000Z"
  },
  {
    id: "8",
    title: "Cloud Computing Basics",
    preview: "Cloud computing has revolutionized how we build and deploy applications. Let's understand the fundamentals.",
    content: "Cloud computing has revolutionized how we build and deploy applications. Let's understand the fundamentals.\n\nCloud computing provides on-demand computing resources over the internet. Instead of owning servers, you rent them. 云计算通过互联网提供按需计算资源，你不需要拥有服务器，而是租用它们。\n\nThere are three main service models:\n1. IaaS (Infrastructure as a Service): Virtual machines, storage, networks\n2. PaaS (Platform as a Service): Development platforms like Heroku, Vercel\n3. SaaS (Software as a Service): Applications like Gmail, Office 365\n\nMajor cloud providers include AWS, Google Cloud, and Microsoft Azure. They offer scalable, reliable infrastructure. 主要云提供商包括 AWS、Google Cloud 和 Microsoft Azure。\n\nBenefits include cost savings, scalability, and reliability. You only pay for what you use, and can scale up or down as needed.\n\nCloud computing has enabled startups to compete with large enterprises by providing access to enterprise-grade infrastructure at affordable prices.",
    createdAt: "2024-01-22T10:10:00.000Z"
  },
  {
    id: "9",
    title: "时间管理的艺术",
    preview: "有效的时间管理是提高工作效率的关键。本文将分享一些实用的时间管理技巧。",
    content: "有效的时间管理是提高工作效率的关键。本文将分享一些实用的时间管理技巧。\n\n首先，要学会制定优先级。不是所有任务都同等重要。可以使用四象限法则：重要且紧急、重要但不紧急、紧急但不重要、既不重要也不紧急。优先处理重要且紧急的事情。\n\n其次，要避免多任务处理。虽然看起来同时做多件事很高效，但实际上会降低专注度和效率。一次只专注于一件事，完成后再做下一件。\n\n第三，要学会说'不'。不要接受所有请求，特别是那些不重要或不紧急的事情。保护自己的时间就是保护自己的效率。\n\n第四，要利用碎片时间。等车、排队时可以处理一些简单任务，比如回复邮件、阅读文章等。\n\n最后，要定期回顾和调整。每周或每月回顾自己的时间使用情况，找出可以改进的地方。",
    createdAt: "2024-01-23T14:00:00.000Z"
  },
  {
    id: "10",
    title: "Blockchain Technology Explained",
    preview: "Blockchain is more than just cryptocurrency. Let's explore how this technology works and its potential applications.",
    content: "Blockchain is more than just cryptocurrency. Let's explore how this technology works and its potential applications.\n\nA blockchain is a distributed ledger that records transactions in a secure, transparent, and immutable way. 区块链是一种分布式账本，以安全、透明和不可篡改的方式记录交易。\n\nEach block contains a list of transactions and a hash of the previous block, creating a chain. This makes it nearly impossible to alter past records without changing all subsequent blocks.\n\nBitcoin was the first successful application of blockchain technology. But blockchain has many other uses: smart contracts, supply chain tracking, digital identity, and voting systems.\n\nKey features include decentralization (no central authority), transparency (all transactions are visible), and security (cryptographic hashing).\n\nHowever, blockchain also has challenges: high energy consumption, scalability issues, and regulatory uncertainty. 然而，区块链也面临挑战：高能耗、可扩展性问题以及监管不确定性。\n\nThe future of blockchain depends on solving these challenges while maintaining its core benefits.",
    createdAt: "2024-01-24T16:30:00.000Z"
  }
];

/**
 * 获取所有文章
 * @returns {Array} 文章数组
 */
function getAllArticles() {
  return articles;
}

/**
 * 根据ID获取文章
 * @param {string} id - 文章ID
 * @returns {Object|null} 文章对象或null
 */
function getArticleById(id) {
  return articles.find(article => article.id === id) || null;
}

module.exports = {
  getAllArticles,
  getArticleById
};

