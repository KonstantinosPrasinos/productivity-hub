import styles from './Divider.module.scss';

const Divider = ({type = 'horizontal'}) => {
    return (
        <div className={`${styles.container} ${styles[type]}`}>

        </div>
    );
};

export default Divider;
