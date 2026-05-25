import { useGlobalLoading } from '../useGlobalLoading';
import styles from './GlobalLoadingBar.module.css';

// Thin animated bar pinned to the top of the viewport, visible whenever any
// API request is in flight. Non-blocking; driven by apiClient's request counter.
const GlobalLoadingBar = () => {
    const loading = useGlobalLoading();

    if (!loading) return null;

    return (
        <div className={styles.track} role="progressbar" aria-label="Loading">
            <div className={styles.indicator} />
        </div>
    );
};

export default GlobalLoadingBar;
