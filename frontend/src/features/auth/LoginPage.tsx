import { GoogleLogin } from '@react-oauth/google';
import { Flex } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import styles from './LoginPage.module.css';

type Props = {
    onCredential: (credential: string) => void;
    onError?: () => void;
    error?: string | null;
};

const LoginPage = ({ onCredential, onError, error: _error }: Props) => {
    return (

        <Flex className={styles.page}>
            <Flex className={styles.brandPanel}>
                <Flex className={styles.brandInner}>
                    <h2 className={styles.brandTitle}>
                        Shop<span className="shopup-logo-accent">Up</span>
                    </h2>
                </Flex>
            </Flex>
            <Flex className={styles.formPanel}>
                <Flex vertical className={styles.formInner}>
                    <span className={styles.eyebrow}>Sign In</span>
                    <h2>Welcome</h2>
                    <GoogleLogin
                        hosted_domain="shopup.org"
                        text="continue_with"
                        theme="outline"
                        size="large"
                        width="400px"
                        onSuccess={(res) => res.credential && onCredential(res.credential)}
                        onError={onError}
                    />
                    <Flex gap={16} className={styles.notice}>
                        <LockOutlined className={styles.noticeIcon} />
                        <span className={styles.noticeText}>
                            Only <b>@shopup.org / @silq.net</b> accounts can access this portal.
                        </span>
                    </Flex>
                </Flex>
            </Flex>
        </Flex>
    );
};

export default LoginPage;
