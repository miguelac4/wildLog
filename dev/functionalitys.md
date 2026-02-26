# Functionalities

## 1. User Authentication and Profile Management
- User registration and login
- Email verification
- Profile creation and editing
- Password reset functionality

## 2. Post Creation and Management
- Create, edit, and delete posts
- Set post visibility (private or public)
- Upload before and after images (take photos directly from platform and redirect them to analysis module)
- Add geospatial data (latitude and longitude)
- Environmental verification status (pending, approved, rejected)

## 3. Environmental Verification System
- Choose a model for image analysis (e.g., OpenCV-based)
- Receive images from backend API
- Compare first image verifying that have camping or not, and the second image verifying that have removed the camping or not
- Analyze images to determine if they meet environmental improvement criteria
- Return verification results to backend API

## 4. Commenting and Favoriting System
- Allow users to comment on public posts
- Implement a favoriting system for users to save posts they like
- Display comments and favorites count on posts

## 5. Profile Ranking System
- Implement a ranking system based on user activity (posts, comments, favorites)
- Display user ranks and levels on profiles
- Provide incentives for higher ranks (e.g., badges, recognition, acess to special international zones)

## 6. Subscription management
- Implement subscription plans for users (free, premium)
- Manage subscription status and access to features based on subscription level
- Provide payment integration for premium subscriptions
- Handle subscription renewals and cancellations
- Provide access to exclusive content or features for premium subscribers (e.g., advanced analytics, priority support)
