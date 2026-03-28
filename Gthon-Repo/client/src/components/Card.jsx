import React from 'react'
import StarRating from './StarRating'

const Card = ({ course }) => {
  return (
    <div className='z-10 bg-white drop-shadow-md overflow-hidden rounded-2xl mr-2  my-4'>
      <img src={course.linkImg}
        className="h-40 w-full object-cover"
        alt={`Course thumbnail for ${course.title}`}

      />
      <div className='p-5 border border-b'>
        <h3 className='py-2 truncate'>{course.title}</h3>
        <StarRating rating={course.rating} />
      </div>
      <h3 className='p-5 text-xl'>{course.price}</h3>

      <div className='absolute top-0 bg-white m-3 px-2 py-[2.5px] rounded font-bold'>
        {course.category}
      </div>
    </div>
  )
}

export default Card