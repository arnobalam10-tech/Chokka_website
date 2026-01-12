import React from 'react';
import { motion } from 'framer-motion';
import { Star, User } from 'lucide-react';

export default function ReviewMarquee({ reviews }) {
  // STRICT CHECK: If no reviews, DO NOT RENDER ANYTHING. 
  // This kills the placeholder (Sarah/Tanvir) behavior.
  if (!reviews || reviews.length === 0) return null;

  // Duplicate list to create infinite loop effect
  const marqueeReviews = [...reviews, ...reviews, ...reviews, ...reviews];

  return (
    <div className="py-16 bg-[#1a3325] border-y-4 border-black overflow-hidden relative">
      
      {/* Title */}
      <div className="text-center mb-10 relative z-10">
        <span className="text-[#2e8b57] font-bold tracking-widest uppercase text-sm">Player Feedback</span>
        <h2 className="text-3xl md:text-4xl font-black text-[#f8f5e6] mt-2 uppercase">
          Street Credibility
        </h2>
      </div>

      {/* The Moving Track */}
      <div className="flex w-full overflow-hidden">
        <motion.div 
          className="flex gap-6 px-4"
          animate={{ x: ["0%", "-50%"] }} 
          transition={{ 
            ease: "linear", 
            duration: 30, // Speed
            repeat: Infinity 
          }}
        >
          {marqueeReviews.map((review, index) => (
            <div 
              key={index} 
              className="flex-shrink-0 w-[300px] bg-[#f8f5e6] p-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)]"
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-3 border-b-2 border-black/10 pb-3">
                <div className="w-10 h-10 bg-[#2e8b57] rounded-full flex items-center justify-center border-2 border-black">
                    <User className="text-white" size={20} />
                </div>
                <div>
                    <h4 className="font-bold text-lg leading-none text-[#1a3325]">{review.customer_name}</h4>
                </div>
              </div>

              {/* Comment */}
              <p className="font-mono text-sm mb-3 opacity-90 text-[#1a3325] min-h-[50px]">
                "{review.comment}"
              </p>

              {/* Stars */}
              <div className="flex text-yellow-500 gap-1">
                {[...Array(review.rating || 5)].map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Fade Gradients */}
      <div className="absolute top-0 left-0 h-full w-16 bg-gradient-to-r from-[#1a3325] to-transparent z-10 pointer-events-none"></div>
      <div className="absolute top-0 right-0 h-full w-16 bg-gradient-to-l from-[#1a3325] to-transparent z-10 pointer-events-none"></div>
    </div>
  );
}