import React, { useState } from 'react';
import { useUiStore } from '../../store/uiStore';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Lightbulb, Wrench, Bot, ArrowLeft } from 'lucide-react';
import CreateIdeaForm from '../specialized/CreateIdeaForm';
import CreateRequestForm from '../specialized/CreateRequestForm';
import CreateSkillForm from '../specialized/CreateSkillForm';

type PublishStep = 'select_type' | 'fill_form';
type ContentType = 'idea' | 'skill' | 'request' | null;

const contentTypes = [
  { type: 'idea' as ContentType, label: '发布一个新创意', icon: Lightbulb, description: '分享你的绝妙点子，寻找共鸣者和合作伙伴。' },
  { type: 'skill' as ContentType, label: '提供一项新技能', icon: Wrench, description: '展示你的专业技能，提供服务或寻找项目。' },
  { type: 'request' as ContentType, label: '提交一个功能需求', icon: Bot, description: '为平台的发展出谋划策，让它变得更好。' },
];

const PublishModal: React.FC = () => {
  const { isPublishModalOpen, closePublishModal } = useUiStore();
  const [step, setStep] = useState<PublishStep>('select_type');
  const [selectedType, setSelectedType] = useState<ContentType>(null);

  const handleSelectType = (type: ContentType) => {
    setSelectedType(type);
    setStep('fill_form');
  };
  
  const handleBack = () => {
    setStep('select_type');
    setSelectedType(null);
  };
  
  const handleClose = () => {
    closePublishModal();
    // 延迟重置状态，避免关闭动画时内容闪烁
    setTimeout(() => {
      setStep('select_type');
      setSelectedType(null);
    }, 300);
  };

  const renderContent = () => {
    if (step === 'select_type') {
      return (
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">您想发布什么？</h2>
          <p className="text-gray-500 mb-8">选择一个类型，开始你的创作之旅。</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contentTypes.map(({ type, label, icon: Icon, description }) => (
              <motion.div
                key={type}
                whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
                className="bg-white p-8 rounded-lg shadow-md border cursor-pointer"
                onClick={() => handleSelectType(type)}
              >
                <Icon className="w-12 h-12 mx-auto text-primary-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{label}</h3>
                <p className="text-sm text-gray-500">{description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      );
    }

    if (step === 'fill_form') {
      const FormComponent = () => {
        switch (selectedType) {
          case 'idea':
            return <CreateIdeaForm onClose={handleClose} />;
          case 'skill':
            return <CreateSkillForm onClose={handleClose} currentMembershipLevel="free" />;
          case 'request':
            return <CreateRequestForm onClose={handleClose} />;
          default:
            return null;
        }
      };

      return (
        <div>
           <h2 className="text-2xl font-bold text-gray-800 mb-8">
                发布新 {selectedType === 'idea' ? '创意' : selectedType === 'skill' ? '技能' : '需求'}
            </h2>
          <FormComponent />
        </div>
      );
    }

    return null;
  };

  return (
    <AnimatePresence>
      {isPublishModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="bg-gray-50 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] relative flex flex-col"
          >
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-gray-50 rounded-t-xl z-10">
              {step === 'fill_form' && (
                <button onClick={handleBack} className="text-gray-500 hover:text-gray-800 transition-colors p-2 -ml-2 rounded-full">
                  <ArrowLeft className="w-6 h-6" />
                </button>
              )}
               <div className="flex-grow"></div>
              <button onClick={handleClose} className="text-gray-500 hover:text-gray-800 transition-colors p-2 -mr-2 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-8 overflow-y-auto">
                {renderContent()}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PublishModal; 