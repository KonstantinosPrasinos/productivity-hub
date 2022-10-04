import styles from './NotFound.module.scss';

const NotFound = () => {
    return (
        <div className={`Rounded-Container Stack-Container ${styles.container}`}>
            <div className={'Title'}>Page not found</div>
            <div className={'Title'}>¯\_(ツ)_/¯</div>
        </div>
    );
};

export default NotFound;
