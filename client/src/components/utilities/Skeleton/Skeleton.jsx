import styled from './Skeleton.module.scss';

const Skeleton = ({width, height, borderRadius}) => {
    return (<div className={styled.container} style={{width, height, borderRadius}}></div>);
}
 
export default Skeleton;