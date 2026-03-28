import React from 'react';
import { BsArrowUpRight } from 'react-icons/bs';

const CategoryCard = ({ icons, title }) => {
  return (
    <button type="button" className='category-card w-full bg-white md:p-4 p-2 shadow-lg rounded-md flex items-center justify-between border border-transparent hover:border-[#20B486] group/edit' aria-label={`Open ${title} category`}>
      <div className='flex items-center gap-4'>
        <span aria-hidden="true">{icons}</span>
        <h3 className='md:text-2xl text-lg font-semibold text-gray-800'>{title}</h3>
      </div>

      <div className='group-hover/edit:bg-[#20B486] rounded-lg p-3'>
        <BsArrowUpRight
          size={30}
          style={{ color: '#20B486' }}
          className='arrow-icon'
          aria-hidden="true"
        />
      </div>
    </button>
  );
};

export default CategoryCard;