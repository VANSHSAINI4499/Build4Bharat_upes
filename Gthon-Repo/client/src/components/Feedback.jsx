import React from 'react'
import Slider from "react-slick";
import FeedbackCard from './FeedbackCard';

const Feedback = () => {
  var settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: false,
          dots: true
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          infinite: false,
          dots: true
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: false,
          dots: true
        }
      }
      // You can unslick at a given breakpoint now by adding:
      // settings: "unslick"
      // instead of a settings object
    ]
  };

  return (
    <section className='w-full bg-white py-32' aria-labelledby="students-feedback-heading">
      <div className='md:max-w-[1480px] m-auto max-w-[600px]  px-4 md:px-0'>
        <div className='py-4'>
          <h2 id="students-feedback-heading" className='py-3 text-3xl font-bold'>Students' <span className='text-[#20B486]'>Feedback</span></h2>
          <p className='text-[#6D737A]'>Various versions have evolved over the years, sometimes by accident.</p>
        </div>

        <div role="region" aria-label="Student feedback carousel">
          <Slider {...settings} >
            <FeedbackCard />
            <FeedbackCard />
            <FeedbackCard />




          </Slider>
        </div>

      </div>

    </section>
  )
}

export default Feedback