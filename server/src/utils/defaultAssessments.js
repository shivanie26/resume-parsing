/**
 * Default Role-Specific MCQ Question Banks
 * Stored securely in MongoDB.
 * Note: `correctOptionIndex` (0 to 3) is server-side only.
 */

const defaultAssessments = [
  {
    role: 'fullstack',
    title: 'Full Stack Web Development Competency Assessment',
    description: 'Evaluates proficiency across modern frontend (React), backend (Node.js/Express), databases (MongoDB/SQL), and RESTful architecture.',
    durationMinutes: 15,
    passingScore: 60,
    questions: [
      {
        questionText: 'In React, what is the primary purpose of the useEffect hook dependency array?',
        options: [
          'To define which CSS classes the component depends on',
          'To control when the side-effect callback function is re-executed',
          'To automatically bind methods to the component instance',
          'To configure the Redux store reducer listeners'
        ],
        correctOptionIndex: 1,
        explanation: 'The dependency array in useEffect tells React to re-run the effect only when the values specified in the array change between renders.',
        difficulty: 'easy',
        skillTopic: 'React'
      },
      {
        questionText: 'In Node.js, how does the Event Loop handle asynchronous non-blocking I/O operations?',
        options: [
          'By spinning up a new OS thread for every individual incoming HTTP request',
          'By delegating asynchronous tasks to libuv worker threads and executing callbacks in appropriate phases',
          'By halting CPU execution until the disk read finishes',
          'By translating JavaScript code directly into synchronous bytecode'
        ],
        correctOptionIndex: 1,
        explanation: 'Node.js utilizes a single main execution thread along with libuv thread pool to execute non-blocking asynchronous I/O and process callbacks in phases.',
        difficulty: 'medium',
        skillTopic: 'Node.js'
      },
      {
        questionText: 'When designing a RESTful API, which HTTP method should be used for an operation that is idempotent and updates or creates a complete resource at a specific URI?',
        options: [
          'POST',
          'PATCH',
          'PUT',
          'OPTIONS'
        ],
        correctOptionIndex: 2,
        explanation: 'PUT is defined by HTTP specifications as idempotent, meaning repeating the same PUT request with the same body yields the identical server state.',
        difficulty: 'medium',
        skillTopic: 'REST APIs'
      },
      {
        questionText: 'In MongoDB, which index type is most appropriate to optimize queries searching for words across large paragraph fields?',
        options: [
          'Compound Index',
          'Geospatial Index',
          'Text Index',
          'Hashed Index'
        ],
        correctOptionIndex: 2,
        explanation: 'MongoDB provides Text indexes to support full-text search queries on string content with stemming and language-aware tokenization.',
        difficulty: 'easy',
        skillTopic: 'MongoDB'
      },
      {
        questionText: 'Which HTTP header prevents cross-site scripting (XSS) by restricting where scripts, styles, and other resources can be loaded from?',
        options: [
          'Access-Control-Allow-Origin',
          'Content-Security-Policy',
          'X-Frame-Options',
          'Strict-Transport-Security'
        ],
        correctOptionIndex: 1,
        explanation: 'Content-Security-Policy (CSP) allows server operators to restrict resources (such as JavaScript, CSS, Images) that the browser is allowed to load for a given page.',
        difficulty: 'hard',
        skillTopic: 'Web Security'
      }
    ]
  },
  {
    role: 'java',
    title: 'Java & Spring Boot Enterprise Competency Assessment',
    description: 'Evaluates core Java OOP principles, JVM memory management, multithreading, and Spring Boot framework architecture.',
    durationMinutes: 15,
    passingScore: 60,
    questions: [
      {
        questionText: 'In Java, what is the key difference between StringBuffer and StringBuilder?',
        options: [
          'StringBuffer is thread-safe (synchronized), whereas StringBuilder is not synchronized and faster in single-threaded environments',
          'StringBuilder is immutable while StringBuffer is mutable',
          'StringBuffer resides in Metaspace while StringBuilder resides on the Heap',
          'StringBuilder cannot be converted to a String'
        ],
        correctOptionIndex: 0,
        explanation: 'StringBuffer methods are synchronized for thread-safety, while StringBuilder has unsynchronized methods providing better performance when thread-safety is not required.',
        difficulty: 'easy',
        skillTopic: 'Core Java'
      },
      {
        questionText: 'In Spring Boot, which annotation is used to inject dependencies automatically by type into Spring beans?',
        options: [
          '@Service',
          '@Autowired',
          '@Component',
          '@Configuration'
        ],
        correctOptionIndex: 1,
        explanation: '@Autowired enables Spring\'s dependency injection facility to automatically resolve and inject collaborating beans into the target class.',
        difficulty: 'easy',
        skillTopic: 'Spring Boot'
      },
      {
        questionText: 'What happens when two threads access a synchronized method of two different instances of the same class simultaneously?',
        options: [
          'One thread will block until the other finishes',
          'A Deadlock exception is thrown immediately',
          'Both threads execute concurrently without blocking because locks are acquired on individual instance monitors',
          'The JVM creates a distributed lock across both objects'
        ],
        correctOptionIndex: 2,
        explanation: 'Non-static synchronized methods lock on "this" instance. Since they are different instances, each thread acquires the lock on its respective instance and executes concurrently.',
        difficulty: 'medium',
        skillTopic: 'Java Multithreading'
      },
      {
        questionText: 'In the JVM memory structure, where are local primitive variables declared inside a method stored during execution?',
        options: [
          'Heap Space',
          'Metaspace / PermGen',
          'JVM Stack Frame',
          'Native Method Stack'
        ],
        correctOptionIndex: 2,
        explanation: 'Local variables and method invocation frames are pushed and popped from the thread\'s call stack (JVM Stack), while objects themselves reside on the Heap.',
        difficulty: 'medium',
        skillTopic: 'JVM Internals'
      },
      {
        questionText: 'In Spring Data JPA, what does the @Transactional(readOnly = true) annotation optimize at the persistence layer?',
        options: [
          'It locks the database table exclusively against other queries',
          'It instructs the Hibernate Session to skip dirty checking and avoids flushing modifications',
          'It prevents database connection pooling',
          'It automatically converts SQL queries to NoSQL syntax'
        ],
        correctOptionIndex: 1,
        explanation: 'readOnly=true informs Hibernate/JPA to disable dirty checking snapshots on managed entities, yielding memory and CPU performance savings.',
        difficulty: 'hard',
        skillTopic: 'Spring Data JPA'
      }
    ]
  },
  {
    role: 'aiml',
    title: 'AI & Machine Learning Engineering Assessment',
    description: 'Evaluates understanding of statistical modeling, machine learning algorithms, deep neural networks, and model validation techniques.',
    durationMinutes: 15,
    passingScore: 60,
    questions: [
      {
        questionText: 'When evaluating a machine learning classifier on a highly imbalanced dataset (e.g. 99% negative, 1% positive), which metric is least informative?',
        options: [
          'Precision',
          'Recall',
          'Overall Accuracy',
          'F1-Score'
        ],
        correctOptionIndex: 2,
        explanation: 'On imbalanced datasets, a naive model that predicts only the majority class achieves 99% accuracy while failing completely on the target minority class.',
        difficulty: 'easy',
        skillTopic: 'Model Evaluation'
      },
      {
        questionText: 'What is the primary cause of the "vanishing gradient problem" in deep feedforward neural networks using Sigmoid activation functions?',
        options: [
          'The learning rate is set to an excessively large value',
          'The derivative of the sigmoid function caps at 0.25, leading to exponential decay of gradients as backpropagation traverses earlier layers',
          'Weights are initialized to infinity',
          'The batch size is smaller than the input dimension'
        ],
        correctOptionIndex: 1,
        explanation: 'The maximum derivative of the sigmoid activation function is 0.25. Repeated multiplication through many layers causes gradients to shrink exponentially toward zero.',
        difficulty: 'medium',
        skillTopic: 'Deep Learning'
      },
      {
        questionText: 'In Natural Language Processing (NLP), what core mechanism allows Transformer models to capture long-range contextual relationships between all words simultaneously?',
        options: [
          'Recurrent Hidden States',
          'Self-Attention Mechanism',
          'Convolutional Max-Pooling',
          'Markov Chain Transitions'
        ],
        correctOptionIndex: 1,
        explanation: 'Scaled Dot-Product Self-Attention calculates query-key-value compatibility across all tokens in parallel, bypassing the sequential bottleneck of RNNs.',
        difficulty: 'medium',
        skillTopic: 'NLP & Transformers'
      },
      {
        questionText: 'Which regularization technique randomly drops units (along with their connections) from the neural network during training to prevent co-adaptation?',
        options: [
          'L1 Lasso Regularization',
          'Batch Normalization',
          'Dropout',
          'Early Stopping'
        ],
        correctOptionIndex: 2,
        explanation: 'Dropout randomly deactivates a fraction of neurons during training passes, forcing the network to learn robust distributed representations.',
        difficulty: 'easy',
        skillTopic: 'Machine Learning'
      },
      {
        questionText: 'In Scikit-learn or Pandas, what is data leakage during feature preprocessing?',
        options: [
          'Loss of memory due to unclosed database connections',
          'Incorporating information from the test/validation set when fitting transformers (e.g. StandardScaler or Imputer) on the training set',
          'Exporting CSV files over unsecured networks',
          'Using floating point numbers instead of integers'
        ],
        correctOptionIndex: 1,
        explanation: 'Data leakage happens when test or future data inadvertently influences model training (such as fitting scalers on the entire dataset before train-test splitting).',
        difficulty: 'medium',
        skillTopic: 'ML Engineering'
      }
    ]
  }
];

module.exports = defaultAssessments;
