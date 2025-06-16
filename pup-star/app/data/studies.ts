import { StudiesData } from '../types/study'

export const studies: StudiesData = {
  '1': {
    id: '1',
    title: 'XAVIER: eXplainable AI with LIME and Grad-CAM for Visual Interpretation and Efficient Fungi Skin Disease Recognition using EfficientNet',
    course: 'Computer Science',
    year: 2019,
    authors: ['Author 1', 'Author 2', 'Author 3', 'Author N'],
    abstract: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam dignissim sem lacus, quis pellentesque ex commodo in. Vivamus elementum dui ligula, sit amet rutrum purus condimentum quis.',
    datePublished: 'June, 2023',
    pdfUrl: '/papers/xavier.pdf',
    sections: {
      introduction: `Addressing the Challenge of Research in Computer Science
      
Content:
This research addresses a prevalent issue in computer science, affecting various aspects of software development. Accurate and timely analysis is crucial for effective development and preventing complications. However, visual analysis by developers can sometimes be challenging due to the subtle variations in code structure and the existence of conditions with similar symptoms. Traditional diagnostic methods can be time-consuming and subjective.

Artificial intelligence (AI) has shown promise in automating and improving various aspects of software development analysis, including development methodology. Models like EfficientNet offer high accuracy with computational efficiency, making them suitable for potential clinical application. However, the "black box" nature of these models hinders trust and adoption by professionals who need to understand why a particular decision was made.

This thesis tackles this challenge by developing an explainable AI system for analysis. We integrate state-of-the-art deep learning with powerful explainability techniques:
• LIME (Local Interpretable Model-Agnostic Explanation): To understand which local features in a specific case most influenced the model's decision.
• Grad-CAM (Gradient-weighted Class Activation Mapping): To visually highlight the regions in the code that the model focused on.

This research aims to improve diagnostic accuracy and provide crucial visual explanations, fostering trust and facilitating the integration of AI into professional practice.`,
      methodology: `Our Approach: Combining Advanced Technologies

Our methodology involved several key stages to build and evaluate the system:

2.1 Dataset:
• Source: A comprehensive dataset including various types of cases
• Size: A total sample number of 10,000 instances
• Annotation: Data was labeled by professionals
• Preprocessing: Images were resized, normalized, and augmented to increase dataset size

2.2 Model Architecture:
• Base Model: Advanced architecture trained on a large dataset
• Fine-tuning: The pre-trained model was fine-tuned on our specific dataset
• Output Layer: Modified to predict the probability of each class

2.3 Explainability Techniques:
• LIME: Applied to individual predictions to identify which elements contributed most
• Grad-CAM: Implemented to generate heatmaps highlighting the regions of interest

2.4 Evaluation:
• Metrics: Model performance was evaluated using standard classification metrics
• Explainability Evaluation: The visual explanations were quantitatively assessed
• Clinical Validation: Results were reviewed by professionals`,
      results: `Headline: Achieving High Accuracy and Actionable Visual Explanations

Our experimental results demonstrate that the system achieves high accuracy while providing valuable visual insights through LIME and Grad-CAM.

3.1 Metrics:
• Accuracy: 92.5%
• Precision: 91.8%
• Recall: 93.1%
• F1-score: 92.3%

3.2 Visual Interpretation Examples:
Below are illustrative examples showing how LIME and Grad-CAM provide explanations for the model's predictions.

Example 1: Correctly Classified Case
• Model Prediction: Correct (Confidence: 95.8%)
• LIME Output: "Key features influencing the prediction were subtle characteristics"
• Grad-CAM Output: "Heatmap shows strong activation concentrated precisely on the key areas"

3.3 Discussion:
The integration of explainability techniques provides a critical layer of transparency to the model's predictions. By visually demonstrating which parts of the input are most influential, clinicians can gain confidence in the system's recommendations.`
    }
  },
  '2': {
    id: '2',
    title: 'RESEARCH TITLE 2: SUBTITLE NG RESEARCH',
    course: 'Information Technology',
    year: 2020,
    authors: ['Author 1', 'Author 2', 'Author 3', 'Author N'],
    abstract: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam dignissim sem lacus, quis pellentesque ex commodo in. Vivamus elementum dui ligula, sit amet rutrum purus condimentum quis.',
    pdfUrl: '/papers/research2.pdf'
  },
  '3': {
    id: '3',
    title: 'RESEARCH TITLE 3: SUBTITLE NG RESEARCH',
    course: 'Computer Science',
    year: 2019,
    authors: ['Author 1', 'Author 2', 'Author 3', 'Author N'],
    abstract: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam dignissim sem lacus, quis pellentesque ex commodo in. Vivamus elementum dui ligula, sit amet rutrum purus condimentum quis.',
    pdfUrl: '/papers/research3.pdf'
  },
  '4': {
    id: '4',
    title: 'RESEARCH TITLE 4: SUBTITLE NG RESEARCH',
    course: 'Information Technology',
    year: 2020,
    authors: ['Author 1', 'Author 2', 'Author 3', 'Author N'],
    abstract: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam dignissim sem lacus, quis pellentesque ex commodo in. Vivamus elementum dui ligula, sit amet rutrum purus condimentum quis.',
    pdfUrl: '/papers/research4.pdf'
  },
  '5': {
    id: '5',
    title: 'RESEARCH TITLE 5: SUBTITLE NG RESEARCH',
    course: 'Computer Science',
    year: 2021,
    authors: ['Author 1', 'Author 2', 'Author 3', 'Author N'],
    abstract: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam dignissim sem lacus, quis pellentesque ex commodo in. Vivamus elementum dui ligula, sit amet rutrum purus condimentum quis.',
    pdfUrl: '/papers/research5.pdf'
  },
  '6': {
    id: '6',
    title: 'RESEARCH TITLE 6: SUBTITLE NG RESEARCH',
    course: 'Information Technology',
    year: 2021,
    authors: ['Author 1', 'Author 2', 'Author 3', 'Author N'],
    abstract: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam dignissim sem lacus, quis pellentesque ex commodo in. Vivamus elementum dui ligula, sit amet rutrum purus condimentum quis.',
    pdfUrl: '/papers/research6.pdf'
  },
  '7': {
    id: '7',
    title: 'RESEARCH TITLE 7: SUBTITLE NG RESEARCH',
    course: 'Computer Science',
    year: 2022,
    authors: ['Author 1', 'Author 2', 'Author 3', 'Author N'],
    abstract: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam dignissim sem lacus, quis pellentesque ex commodo in. Vivamus elementum dui ligula, sit amet rutrum purus condimentum quis.',
    pdfUrl: '/papers/research7.pdf'
  },
  '8': {
    id: '8',
    title: 'RESEARCH TITLE 8: SUBTITLE NG RESEARCH',
    course: 'Information Technology',
    year: 2022,
    authors: ['Author 1', 'Author 2', 'Author 3', 'Author N'],
    abstract: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam dignissim sem lacus, quis pellentesque ex commodo in. Vivamus elementum dui ligula, sit amet rutrum purus condimentum quis.',
    pdfUrl: '/papers/research8.pdf'
  }
} 